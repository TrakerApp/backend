import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';

const dynamodbClient = new DynamoDBClient({ region: process.env.REGION });

module.exports.handler = async (event, context) => {
	const userId = "asdf1234"; // temporal until we have cognito implemented in app

	const params = {
		TableName: process.env.TRACKINGS_TABLE,
		KeyConditionExpression: "userId = :userId",
		ExpressionAttributeValues: { // what are we querying
			":userId": { S: userId }
		},
		ExpressionAttributeNames: { // mapping for reserved fucking "name"
			"#c": "name"
		},
		ProjectionExpression: "#c, lastOccurenceAt",
	}

	const data = await dynamodbClient.send(new QueryCommand(params));

	const items = data.Items.map(item => {
		return {
			name: item.name.S,
			lastOccurenceAt: item.lastOccurenceAt?.S
		}
	})

	return {
		statusCode: 200,
		body: JSON.stringify({
			total: data.Count,
			trackings: items
		}),
	}
}
