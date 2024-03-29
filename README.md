# TrakerApp

## Folder Structure
- `/infra/`: ymls defining non-lambda resources like DB and roles.
- `/services/`: all functions logic and yml definitions. It's versioned.

Service example:
- `/services/{version}/{namespace}/`: main folder containing code of this namespace
- `/services/{version}/{namespace}/src/{action}/index.js`: Specific implementation of the action of that namespace
- `/services/{version}/{namespace}/src/{action}/function.yml`: Function serverless definition
- `/services/{version}/{namespace}/src/{action}/package.json`: Function-specific required packages

### Deployment

In order to deploy the example, you need to run the following command:

```
$ serverless deploy
```

After running deploy, you should see output similar to:

```bash
Deploying aws-node-project to stage dev (us-east-1)

✔ Service deployed to stack aws-node-project-dev (112s)

functions:
  hello: aws-node-project-dev-hello (1.5 kB)
```

### Invocation

After successful deployment, you can invoke the deployed function by using the following command:

```bash
serverless invoke --function hello
```

Which should result in response similar to the following:

```json
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Go Serverless v3.0! Your function executed successfully!\",\n  \"input\": {}\n}"
}
```

### Local development

You can invoke your function locally by using the following command:

```bash
serverless invoke local --function hello
```

Which should result in response similar to the following:

```
{
    "statusCode": 200,
    "body": "{\n  \"message\": \"Go Serverless v3.0! Your function executed successfully!\",\n  \"input\": \"\"\n}"
}
```
