#!/usr/bin/env python3
"""
PostgreSQL RDS Client for DevClimb
Simple and efficient database operations for roadmap management.
"""

import psycopg2
import psycopg2.extras
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
import logging

logger = logging.getLogger(__name__)

class PostgreSQLRDSClient:
    """Simple PostgreSQL RDS client for DevClimb roadmap management"""
    
    def __init__(self):
        self.connection_config = {
            'host': os.getenv('RDS_HOST', 'devclimb-rds.ce7co0yow46b.us-east-1.rds.amazonaws.com'),
            'port': int(os.getenv('RDS_PORT', 5432)),
            'database': os.getenv('RDS_DATABASE', 'postgres'),
            'user': os.getenv('RDS_USERNAME','postgres'),
            'password': os.getenv('RDS_PASSWORD', 'devclimb1!'),
            'sslmode': 'require',
            'connect_timeout': 10,
            'application_name': 'devclimb-backend'
        }
        logger.info("PostgreSQL RDS client initialized")
    
    def get_connection(self):
        """Get a fresh PostgreSQL connection"""
        try:
            conn = psycopg2.connect(**self.connection_config)
            return conn
        except psycopg2.Error as e:
            logger.error(f"PostgreSQL connection error: {e}")
            raise
    
    def execute_query(self, query: str, params: tuple = None, fetch: bool = False) -> Any:
        """Execute a single query with error handling"""
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute(query, params)
                if fetch:
                    return cursor.fetchall()
                return cursor.rowcount
    
    def execute_query_single(self, query: str, params: tuple = None) -> Optional[Dict]:
        """Execute query and return single row as dict"""
        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                cursor.execute(query, params)
                return cursor.fetchone()
    
    def fetch_one(self, query: str, params: tuple = None) -> Optional[tuple]:
        """Execute query and return single row as tuple"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                return cursor.fetchone()
    
    def execute_many(self, query: str, params_list: List[tuple]) -> int:
        """Execute multiple queries efficiently"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.executemany(query, params_list)
                conn.commit()
                return cursor.rowcount


class JobTrackingOperations:
    """Operations for managing roadmap generation jobs"""
    
    def __init__(self, client: PostgreSQLRDSClient):
        self.client = client
    
    def create_job(self, job_id: int) -> bool:
        """Create a new job with 'in progress' status"""
        try:
            query = """
                INSERT INTO roadmap_generation (id, status, roadmap_id) 
                VALUES (%s, 'in progress', NULL)
            """
            self.client.execute_query(query, (job_id,))
            return True
        except Exception as e:
            print(f"Error creating job {job_id}: {e}")
            return False
    
    def update_job_completion(self, job_id: int, roadmap_id: int) -> bool:
        """Update job status to complete and set roadmap_id"""
        try:
            query = """
                UPDATE roadmap_generation 
                SET status = 'complete', roadmap_id = %s 
                WHERE id = %s
            """
            self.client.execute_query(query, (roadmap_id, job_id))
            return True
        except Exception as e:
            print(f"Error updating job {job_id}: {e}")
            return False
    
    def get_job_status(self, job_id: int) -> Optional[Dict]:
        """Get job status and roadmap_id if complete"""
        try:
            query = """
                SELECT id, status, roadmap_id 
                FROM roadmap_generation 
                WHERE id = %s
            """
            result = self.client.fetch_one(query, (job_id,))
            if result:
                return {
                    'job_id': result[0],
                    'status': result[1],
                    'roadmap_id': result[2] if result[2] != 0 else None
                }
            return None
        except Exception as e:
            print(f"Error getting job status {job_id}: {e}")
            return None
    
    def delete_job(self, job_id: int) -> bool:
        """Delete job record (cleanup)"""
        try:
            query = "DELETE FROM roadmap_generation WHERE id = %s"
            self.client.execute_query(query, (job_id,))
            return True
        except Exception as e:
            print(f"Error deleting job {job_id}: {e}")
            return False

class RoadmapOperations:
    """Business operations for roadmap management"""
    
    def __init__(self, rds_client: PostgreSQLRDSClient):
        self.rds = rds_client
    
    def create_roadmap(self, user_id: int, role_id: int, duration_weeks: int = 12, weekly_hours_target: int = 8) -> int:
        """Create roadmap and return roadmap_id"""
        query = """
        INSERT INTO roadmaps (user_id, role_id, duration_weeks, weekly_hours_target) 
        VALUES (%s, %s, %s, %s) 
        RETURNING roadmap_id
        """
        result = self.rds.execute_query_single(query, (user_id, role_id, duration_weeks, weekly_hours_target))
        logger.info(f"Created roadmap {result['roadmap_id']} for user {user_id}")
        return result['roadmap_id']
    
    def get_user_roadmaps_summary(self, user_id: int) -> List[Dict]:
        """Get user's roadmaps with basic info and progress"""
        query = """
        SELECT 
            r.roadmap_id,
            r.duration_weeks,
            r.weekly_hours_target,
            r.generated_at,
            ro.role_name as target_role,
            COALESCE(
                ROUND(
                    ((COUNT(CASE WHEN dt.completed = TRUE THEN 1 END)::float / 
                     NULLIF(COUNT(dt.task_id), 0)::float) * 100)::NUMERIC, 1
                ), 0
            ) as progress_percentage,
            COALESCE(
                (SELECT week_index FROM weeks w2 
                 JOIN daily_tasks dt2 ON w2.week_id = dt2.week_id 
                 WHERE w2.roadmap_id = r.roadmap_id AND dt2.completed = FALSE 
                 ORDER BY w2.week_index LIMIT 1), 
                r.duration_weeks
            ) as current_week
        FROM roadmaps r
        JOIN roles ro ON r.role_id = ro.role_id
        LEFT JOIN weeks w ON r.roadmap_id = w.roadmap_id
        LEFT JOIN daily_tasks dt ON w.week_id = dt.week_id
        WHERE r.user_id = %s
        GROUP BY r.roadmap_id, ro.role_name
        ORDER BY r.generated_at DESC
        """
        return self.rds.execute_query(query, (user_id,), fetch=True)
    
    def get_roadmap_details(self, roadmap_id: int) -> Optional[Dict]:
        """Get roadmap metadata"""
        query = """
        SELECT 
            r.roadmap_id,
            r.user_id,
            r.duration_weeks,
            r.weekly_hours_target,
            r.generated_at,
            ro.role_name as target_role
        FROM roadmaps r
        JOIN roles ro ON r.role_id = ro.role_id
        WHERE r.roadmap_id = %s
        """
        return self.rds.execute_query_single(query, (roadmap_id,))
    
    def get_week_details(self, roadmap_id: int, week_index: int) -> Optional[Dict]:
        """Get week details with daily tasks"""
        # Get week info
        week_query = """
        SELECT week_id, week_index, theme, skills_focus, weekly_task
        FROM weeks 
        WHERE roadmap_id = %s AND week_index = %s
        """
        week = self.rds.execute_query_single(week_query, (roadmap_id, week_index))
        
        if not week:
            return None
        
        # Get daily tasks for this week
        tasks_query = """
        SELECT task_id, day_number, task_description, date, completed
        FROM daily_tasks 
        WHERE week_id = %s
        ORDER BY day_number
        """
        tasks = self.rds.execute_query(tasks_query, (week['week_id'],), fetch=True)
        
        # Calculate completion rate
        total_tasks = len(tasks)
        completed_tasks = sum(1 for task in tasks if task['completed'])
        completion_rate = round(completed_tasks / total_tasks, 2) if total_tasks > 0 else 0
        
        return {
            'week_index': week['week_index'],
            'theme': week['theme'],
            'skills_focus': json.loads(week['skills_focus']) if isinstance(week['skills_focus'], str) else week['skills_focus'],
            'weekly_task': week['weekly_task'],
            'daily_tasks': [dict(task) for task in tasks],
            'completion_rate': completion_rate
        }
    
    def get_roadmap_progress(self, roadmap_id: int) -> Dict:
        """Calculate overall roadmap progress"""
        query = """
        SELECT 
            COUNT(dt.task_id) as total_tasks,
            COUNT(CASE WHEN dt.completed = TRUE THEN 1 END) as completed_tasks,
            COUNT(DISTINCT w.week_id) as total_weeks,
            COUNT(DISTINCT CASE WHEN dt.completed = TRUE THEN w.week_id END) as weeks_with_progress,
            MAX(w.week_index) as max_week
        FROM weeks w
        LEFT JOIN daily_tasks dt ON w.week_id = dt.week_id
        WHERE w.roadmap_id = %s
        """
        result = self.rds.execute_query_single(query, (roadmap_id,))
        
        if not result or result['total_tasks'] == 0:
            return {
                'overall_progress': 0.0,
                'completed_tasks': 0,
                'total_tasks': 0,
                'current_week': 1
            }
        
        # Find current week (first week with incomplete tasks)
        current_week_query = """
        SELECT w.week_index
        FROM weeks w
        JOIN daily_tasks dt ON w.week_id = dt.week_id
        WHERE w.roadmap_id = %s AND dt.completed = FALSE
        ORDER BY w.week_index
        LIMIT 1
        """
        current_week_result = self.rds.execute_query_single(current_week_query, (roadmap_id,))
        current_week = current_week_result['week_index'] if current_week_result else result['max_week']
        
        overall_progress = round((result['completed_tasks'] / result['total_tasks']) * 100, 1)
        
        return {
            'overall_progress': overall_progress,
            'completed_tasks': result['completed_tasks'],
            'total_tasks': result['total_tasks'],
            'current_week': current_week
        }
    
    def mark_task_complete(self, task_id: int, completed: bool = True) -> bool:
        """Mark a task as complete or incomplete"""
        query = "UPDATE daily_tasks SET completed = %s WHERE task_id = %s"
        rows_affected = self.rds.execute_query(query, (completed, task_id))
        logger.info(f"Task {task_id} marked as {'completed' if completed else 'incomplete'}")
        return rows_affected > 0
    
    def delete_roadmap(self, roadmap_id: int) -> bool:
        """Delete roadmap (CASCADE will handle weeks and tasks)"""
        query = "DELETE FROM roadmaps WHERE roadmap_id = %s"
        rows_affected = self.rds.execute_query(query, (roadmap_id,))
        logger.info(f"Deleted roadmap {roadmap_id}")
        return rows_affected > 0
    
    def populate_roadmap_from_json(self, roadmap_json: Dict, user_id: int, role_id: int, start_date: str = None) -> int:
        """Complete roadmap population from JSON data"""
        if not start_date:
            start_date = datetime.now().strftime('%Y-%m-%d')
        
        start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
        
        with self.rds.get_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                # Create roadmap
                cursor.execute("""
                    INSERT INTO roadmaps (user_id, role_id, duration_weeks, weekly_hours_target) 
                    VALUES (%s, %s, %s, %s) 
                    RETURNING roadmap_id
                """, (
                    user_id, 
                    role_id, 
                    int(roadmap_json['meta']['duration_weeks']),
                    int(roadmap_json['meta']['weekly_hours_target'])
                ))
                roadmap_id = cursor.fetchone()['roadmap_id']
                
                # Insert weeks and collect week_ids
                week_id_map = {}
                for week in roadmap_json['roadmap']['weeks']:
                    cursor.execute("""
                        INSERT INTO weeks (roadmap_id, week_index, theme, skills_focus, weekly_task) 
                        VALUES (%s, %s, %s, %s, %s) 
                        RETURNING week_id
                    """, (
                        roadmap_id,
                        int(week['week_index']),
                        week['theme'],
                        json.dumps(week['skills_focus']),
                        week['weekly_task']
                    ))
                    week_id = cursor.fetchone()['week_id']
                    week_id_map[int(week['week_index'])] = week_id
                
                # Prepare daily tasks data
                tasks_data = []
                for week in roadmap_json['roadmap']['weeks']:
                    week_index = int(week['week_index'])
                    week_id = week_id_map[week_index]
                    
                    for daily_task in week['daily_tasks']:
                        task_date = start_datetime + timedelta(
                            weeks=week_index - 1,
                            days=int(daily_task['day']) - 1
                        )
                        
                        for task_desc in daily_task['tasks']:
                            tasks_data.append((
                                week_id,
                                int(daily_task['day']),
                                task_desc,
                                task_date.strftime('%Y-%m-%d'),
                                False  # completed = false by default
                            ))
                
                # Bulk insert daily tasks
                cursor.executemany("""
                    INSERT INTO daily_tasks (week_id, day_number, task_description, date, completed) 
                    VALUES (%s, %s, %s, %s, %s)
                """, tasks_data)
                
                conn.commit()
                logger.info(f"Successfully populated roadmap {roadmap_id} with {len(tasks_data)} tasks")
                return roadmap_id
