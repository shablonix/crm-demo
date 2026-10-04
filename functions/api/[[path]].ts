import { handleApi, type Env } from '../../api.ts'

export const onRequest = async ({ request, env }: { request: Request; env: Env }) =>
	(await handleApi(request, env))!
