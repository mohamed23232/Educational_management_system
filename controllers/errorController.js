// controllers/errorController.js
exports.handle404 = (req, res) => {
    const statusCode = 404;
    const message = "Oops! Page not found."; // Default message for 404 error
    let redirectTo = '/'; // Default redirect for unauthenticated users

    if (req.session && req.session.user) {
        // Dynamically create the redirect URL based on user role
        redirectTo = `/auth/${req.session.user.role}_dashboard`;
    }

    // Render the error page with statusCode, message, and redirectTo
    res.status(statusCode).render('error_page', { statusCode, message, redirectTo });
};

