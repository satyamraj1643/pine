class JWTAuthCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        print("📦 Request cookies:", request.COOKIES)

        access_token = request.COOKIES.get('access')
        refresh_token = request.COOKIES.get('refresh')

        print("🔐 Access token from cookie:", access_token)
        print("🔁 Refresh token from cookie:", refresh_token)

        if access_token and 'HTTP_AUTHORIZATION' not in request.META:
            request.META['HTTP_AUTHORIZATION'] = f'JWT {access_token}'

        # Optional: Add refresh token to a custom header if you want to access it in views
        if refresh_token and 'HTTP_X_REFRESH_TOKEN' not in request.META:
            request.META['HTTP_X_REFRESH_TOKEN'] = refresh_token

        return self.get_response(request)
