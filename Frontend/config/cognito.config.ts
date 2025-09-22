import { Amplify } from 'aws-amplify';

// AWS Cognito Configuration
export const cognitoConfig = {
  Auth: {
    Cognito: {
      region: 'us-east-1',
      userPoolId: 'us-east-1_kLGqUcXeE',
      userPoolClientId: '5nnufk5bktc74ssesl8dbo9hkb',
      loginWith: {
        email: true,
      },
    },
  },
};

// Configure Amplify
export const configureCognito = () => {
  Amplify.configure(cognitoConfig);
};
