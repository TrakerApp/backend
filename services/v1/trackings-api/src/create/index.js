import { nanoid } from 'nanoid';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export const handler = async (event) => {
	const { name } = JSON.parse(event.body);
	console.log("DynamoDB is", DynamoDB)

	return {
		statusCode: 200,
		body: JSON.stringify({
			message: 'create tracking!',
			input: { "name": name, id: nanoid() },
		}),
	}
}
