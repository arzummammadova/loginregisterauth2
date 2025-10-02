// import jwt from "jsonwebtoken";

// const authMiddleware = (req, res, next) => {
//     try {
//         const token = req.cookies.token; // Tokeni çərəzdən oxuyur
//         if (!token) {
//             return res.status(401).json({ message: "Token yoxdu Login ol" });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded;
//         next();
//     } catch (error) {
//         res.status(401).json({ message: "Invalid token" });
//     }
// };

// export default authMiddleware;
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    try {
        let token = null;

        // 1. Əvvəlcə Authorization header-dən yoxla
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // "Bearer " hissəsini çıxart
            console.log("✅ Token Authorization header-dən alındı");
        }

        // 2. Əgər header-də yoxdursa, cookies-dən oxu
        if (!token) {
            token = req.cookies.token;
            if (token) {
                console.log("✅ Token cookies-dən alındı");
            }
        }

        // 3. Hələ də token yoxdursa, xəta ver
        if (!token) {
            console.log("❌ Token tapılmadı");
            return res.status(401).json({ message: "Token yoxdur. Zəhmət olmasa daxil olun." });
        }

        // 4. Token-i verify et
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 5. req.user obyektinə user məlumatlarını əlavə et
        req.user = {
            _id: decoded.id,  // ✅ MongoDB ObjectId
            id: decoded.id,   // ✅ Alternativ accessor
            email: decoded.email,
            role: decoded.role,
        };

        console.log("🔐 İstifadəçi autentifikasiya olundu:", {
            id: req.user._id,
            email: req.user.email,
            role: req.user.role
        });

        next();
    } catch (error) {
        console.error("❌ Token verification xətası:", error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Token etibarsızdır" });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token vaxtı keçib. Yenidən daxil olun." });
        }
        
        return res.status(401).json({ message: "Autentifikasiya xətası" });
    }
};

export default authMiddleware;