const pool = require('../config/db')
exports.getComments = async (req, res) => {
  try {
    const { photo_id } = req.params; 
    const user_id = req.user ? req.user.id : null;

      if (!photo_id) {
          return res.status(400).json({ error: "xatolik " });
      }
      const comments = await pool.query(
        `
        SELECT 
            comments.*, 
            users.lastname,
            users.firstname, 
            COUNT(comment_likes.id) AS like_count,
            EXISTS(
                SELECT 1 FROM comment_likes 
                WHERE comment_likes.comment_id = comments.id 
                AND comment_likes.user_id = $2
            ) AS liked_by_user
        FROM comments 
        LEFT JOIN users ON comments.user_id = users.id
        LEFT JOIN comment_likes ON comments.id = comment_likes.comment_id
        WHERE comments.photo_id = $1
        GROUP BY comments.id, users.lastname, users.firstname
        ORDER BY comments.id DESC;
        `,
        [photo_id, user_id] )
      res.json(comments.rows);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Kommentariyalarni olishda xatolik" });
  }
};

  
  exports.commentOnPost = async (req, res) => {
    try {
      const { user_id, photo_id, text } = req.body; 
      const result = await pool.query(
        `INSERT INTO comments (user_id, photo_id, text) VALUES ($1, $2, $3) RETURNING *`,
        [user_id, photo_id, text]
      );
      res.json({
        message: "Kommentariya qo'shildi",
        comment: result.rows[0],
      });
    } catch (error) { 
        console.log(error);
        res.status(500).json({ error: "Kommentada xatolik" });
        console.error(error)
    }
  };

  exports.likeComment = async (req, res) => {
    try {
      const { user_id, comment_id } = req.body;
      const likeExists = await pool.query(
        `SELECT * FROM comment_likes WHERE user_id = $1 AND comment_id = $2`, 
        [user_id, comment_id]
      );
  
      if (likeExists.rows.length > 0) {
        await pool.query(
          `DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2`,
          [user_id, comment_id]
        );
        return res.json({ message: "Kommentariyaga like o‘chirildi" });
      }
      await pool.query(
        `INSERT INTO comment_likes (user_id, comment_id) VALUES ($1, $2)`,
        [user_id, comment_id]
      );
      res.json({ message: "Kommentariyaga like qo‘yildi" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Kommentariyaga like funksiyasida xatolik" });
    }
  };
  
  exports.unlikeComment = async (req, res) => {
    try {
      const { user_id, comment_id } = req.body;
      await pool.query(
        `DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2`,
        [user_id, comment_id]
      );
      res.json({ message: "Kommentariyaga like o‘chirildi" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Kommentariyaga like o‘chirishda xatolik" });
    }
  };
  