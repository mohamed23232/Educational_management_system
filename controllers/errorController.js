// controllers/errorController.js

exports.handle404 = (req, res) => {
    if (req.session && req.session.user) {
        // Dynamically create the redirect URL based on user role
        const redirectTo = `/auth/${req.session.user.role}_dashboard`;
        res.status(404).render('error_page', { redirectTo });
    } else {
        res.status(404).render('error_page', { redirectTo: '/' });
    }
};
