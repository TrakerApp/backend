import { nanoid } from 'nanoid';
import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' });

export const handler = async (event) => {
	const userId = "asdf1234"; // temporal until we have cognito implemented in app
	const { name } = JSON.parse(event.body);

	const trackingId = nanoid();

	const params = {
		TableName: process.env.TRACKINGS_TABLE,
		ConditionExpression: "attribute_not_exists(#c)",
		ExpressionAttributeNames: {
			"#c": "name"
		},
		Item: {
			userId: { S: userId },
			name: { S: name },
			trackingId: { S: trackingId },
			createdAt: { N: `${(new Date()).getTime()}` }
		}
	}

	try {
		await dynamodbClient.send(new PutItemCommand(params))

		return {
			statusCode: 201,
			body: JSON.stringify({
				trackingId
			})
		}
	} catch (error) {
		console.error("ERROR:", error)

		return {
			statusCode: 500,
			body: JSON.stringify({
				message: 'error',
				input: error,
			}),
		}
	}
}
