const pool = require("../config/db");

exports.togleLike = async (req, res) => {
  try {
    const { user_id, photo_id } = req.body;
    if (!user_id || !photo_id) {
      return res.status(400).json({ error: "user_id va photo_id kerak" });
    }

    const existingLike = await pool.query(
      `SELECT * FROM likes WHERE user_id = $1 AND photo_id = $2`,
      [user_id, photo_id]
    );

    let liked = false;
    if (existingLike.rows.length > 0) {
      await pool.query(
        `DELETE FROM likes WHERE user_id = $1 AND photo_id = $2`,
        [user_id, photo_id]
      );
      liked = false;
    } else {
      await pool.query(
        `INSERT INTO likes (user_id, photo_id) VALUES ($1, $2)`,
        [user_id, photo_id]
      );
      liked = true;
    }

    const likeCount = await pool.query(
      `SELECT COUNT(*) FROM likes WHERE photo_id = $1`,
      [photo_id]
    );

    res.status(200).json({
      liked: liked,
      likeCount: parseInt(likeCount.rows[0].count),
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server xatosi" });
  }
};
