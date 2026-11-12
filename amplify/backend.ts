import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';

const backend = defineBackend({ auth, data });

const bedrock = backend.data.resources.graphqlApi.addHttpDataSource(
  'bedrockDS',
  'https://bedrock-runtime.us-east-2.amazonaws.com',
  {
    authorizationConfig: {
      signingRegion: 'us-east-2',
      signingServiceName: 'bedrock',
    },
  },
);

bedrock.grantPrincipal.addToPrincipalPolicy(new PolicyStatement({
  actions: ['bedrock:InvokeModel'],
  resources: [
    'arn:aws:bedrock:us-east-2::foundation-model/amazon.nova-lite-v1:0',
  ],
}));