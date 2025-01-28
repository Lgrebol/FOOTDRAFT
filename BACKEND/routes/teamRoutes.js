import express from 'express';
import { createTeam, getTeams, deleteTeam } from '../controllers/teamController.js';

const router = express.Router();

router.post('/', createTeam);
router.get('/', getTeams);
router.delete('/:id', deleteTeam);

export default router;
