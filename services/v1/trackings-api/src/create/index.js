import { nanoid } from 'nanoid';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

const dynamodbClient = new DynamoDBClient({ region: 'us-east-1' });

export const handler = async (event) => {
	const { name } = JSON.parse(event.body);
	const trackingId = nanoid();

	const params = {
		TableName: process.env.TRACKINGS_TABLE,
		Item: {
			id: { S: trackingId },
			name: { S: name },
		}
	}

	try {
		await dynamodbClient.send(new PutItemCommand(params))

		return {
			statusCode: 201,
			body: JSON.stringify({
				id: trackingId
			}),
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
