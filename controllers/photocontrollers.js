const { log } = require("console");
const pool = require("../config/db");
const multer = require("multer");

exports.adphoto = async (req, res) => {
  try {
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "❌ Foydalanuvchi ID kerak!" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "❌ Rasm fayli kerak!" });
    }

    const imageUrl = req.file.path;

    const result = await pool.query(
      "INSERT INTO photos (user_id, image_url) VALUES ($1, $2) RETURNING *",
      [userId, imageUrl]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("❌ Server xatolik:", error);
    res.status(500).json({ message: "❌ Serverda xatolik yuz berdi" });
  }
};


exports.getphoto = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT photos.id, 
              COALESCE(photos.image_url, 'default.png') AS image_url, 
              users.firstname, users.lastname, 
              COALESCE(COUNT(likes.photo_id), 0) AS likeCount, 
              FALSE AS isLiked
       FROM photos
       LEFT JOIN likes ON likes.photo_id = photos.id
       INNER JOIN users ON photos.user_id = users.id
       GROUP BY photos.id, users.id, users.firstname, users.lastname;`
    );

    const photos = result.rows.map((photo) => {
      let correctedImageUrl = photo.image_url ? photo.image_url.replace(/\\/g, '/') : 'uploads/default.png';
      return {
        ...photo,
        image_url: `http://localhost:4000/${correctedImageUrl}`,
      };
    });

    res.status(200).json(photos);
  } catch (error) {
    console.error("Xatolik:", error.message);
    res.status(500).json({ message: "Serverda xatolik" });
  }
};


exports.myphoto = async (req, res) => {
  try {
    const { userid } = req.params;
    const currentUserId = req.query.currentUserId || userid;
    if (!userid || isNaN(userid)) {
      return res.status(400).json({ message: "❌ Noto‘g‘ri foydalanuvchi ID" });
    }
    const result = await pool.query(
      `SELECT p.id, 
              COALESCE(p.image_url, 'default.png') AS image_url, 
              u.firstname, 
              u.lastname, 
              COALESCE(l.like_count, 0) AS likeCount, 
              EXISTS (
                  SELECT 1 FROM likes 
                  WHERE likes.photo_id = p.id 
                  AND likes.user_id = $2
              ) AS isLiked
       FROM photos p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN (
           SELECT photo_id, COUNT(*) AS like_count 
           FROM likes GROUP BY photo_id
       ) l ON l.photo_id = p.id
       WHERE p.user_id = $1
       ORDER BY p.id DESC;`,
      [userid, currentUserId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "❌ Ushbu foydalanuvchida rasm topilmadi" });
    }
    const photos = result.rows.map(photo => ({
      ...photo,
      image_url: `http://localhost:4000/${photo.image_url.replace(/\\/g, '/')}`
    }));

    res.status(200).json(photos);
  } catch (error) {
    console.error("❌ Xatolik:", error);
    res.status(500).json({ message: "❌ Serverda ichki xatolik yuz berdi" });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const photoId = parseInt(id, 10);
    if (isNaN(photoId)) {
      return res.status(400).json({ message: "❌ Noto‘g‘ri rasm ID" });
    }
    const checkPhoto = await pool.query("SELECT * FROM photos WHERE id = $1", [
      photoId,
    ]);
    if (checkPhoto.rows.length === 0) {
      console.log(` Rasm topilmadi, ID: ${photoId}`);
      return res
        .status(404)
        .json({ message: " Rasm topilmadi yoki allaqachon o‘chirilgan" });
    }
    const del = await pool.query(
      "DELETE FROM photos WHERE id = $1 RETURNING *",
      [photoId]
    )
    console.log(` O‘chirilgan rasm ID: ${photoId}`);
    res.status(200).json({ message: " Rasm muvaffaqiyatli o‘chirildi" });
  } catch (error) {
    console.error("Serverda xatolik:", error);
    res.status(500).json({ message: " Serverda xatolik yuz berdi" });
  }
};
