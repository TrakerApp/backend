// ALWAYS USE ID TOKEN IN FRONT FOR CALLS TO BACKEND
export function getUserId(event) {
	return event.requestContext?.authorizer?.jwt?.claims?.sub
}

export function getUserEmail(event) {
	return event.requestContext?.authorizer?.jwt?.claims?.email
}

export function getUserPlanName(event) {
	return event.requestContext?.authorizer?.jwt?.claims?.['custom:plan_name']
}

/*
ID TOKEN CLAIMS:
  aud: 'adsfasdfasdf',
  auth_time: '1666362361',
  'cognito:username': 'thisistheuserID',
  'custom:plan_name': 'beta',
  email: 'emailhere',
  email_verified: 'true',
  event_id: 'some uuid',
  exp: '1666365964',
  iat: '1666362364',
  iss: 'our pool ISS',
  jti: 'jwt id',
  origin_jti: 'jwt id 2?',
  sub: 'thisistheuserID',
  token_use: 'id'
*/
