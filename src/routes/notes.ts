import { Router } from 'express';
import { getNotes, createNote, deleteNote } from '../controllers/notes.js';

const router = Router();

router.get('/notes', getNotes);
router.post('/notes', createNote);
router.delete('/notes/:id', deleteNote);

export default router;
