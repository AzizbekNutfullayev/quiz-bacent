const pool = require('../config/db');
const bcryptjs = require('bcryptjs');
const multer = require('multer')

exports.getuser = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users");

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Xatolik:", error.message);

        res.status(500).send("Serverda  xatolik");
    }
};

exports.sigup = async (req, res) => {
    try {
        const { firstname, lastname, username, password, adPhoto } = req.body;

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE username = $1",
            [username]      
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Bu username allaqachon mavjud" });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const newUser = await pool.query(
            "INSERT INTO users (firstname, lastname, username, password, adPhoto) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [firstname, lastname, username, hashedPassword, adPhoto]
        );

        res.status(201).json({ user: newUser.rows[0] });

    } catch (error) {
        console.error("Xatolik:", error);
        res.status(500).send("Serverda  xatolik ");
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const userResult = await pool.query(
            "SELECT * FROM users WHERE username = $1 LIMIT 1",
            [username]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: "Username yoki parol noto‘g‘ri" });
        }

        const user = userResult.rows[0];

        const isPasswordCorrect = await bcryptjs.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "😡Parol yoki username xato" });
        }

        res.status(200).json({
            message: " 😀Muvafaqiyatli o'tiz ",
            user
        });

    } catch (error) {
        console.error("😡Xatolik:", error.message);

        res.status(500).send("Serverda  xatolik ");
    }
};