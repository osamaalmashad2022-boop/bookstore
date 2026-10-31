import { Router, Request, Response } from 'express';
import { getSmartRecommendation } from '../services/recommender';

const router = Router();

// POST /api/recommend - Smart Book Advisor
router.post('/', async (req: Request, res: Response) => {
  try {
    const { mode, quiz, query } = req.body;

    if (!mode || (mode !== 'quiz' && mode !== 'natural')) {
      return res.status(400).json({
        success: false,
        error: 'يجب تحديد وضع البحث (quiz أو natural)',
      });
    }

    if (mode === 'natural' && (!query || query.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'يرجى كتابة استفسارك أو المجال المطلوب ترشيح كتب فيه',
      });
    }

    const recommendation = await getSmartRecommendation({
      mode,
      quiz,
      query,
    });

    res.json({
      success: true,
      ...recommendation,
    });
  } catch (error: any) {
    console.error('Advisor error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ أثناء إعداد الترشيحات الذكية',
    });
  }
});

export default router;
