'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  Avatar,
  Divider,
  CircularProgress
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';
import { IssueComment } from '../types';
import ComputerIcon from '@mui/icons-material/Computer';

interface IssueCommentsProps {
  issueId: string;
  comments: IssueComment[];
  onAddComment: (issueId: string, body: string) => Promise<void>;
  isLoading?: boolean;
}

function CommentItem({ comment }: { comment: IssueComment }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Avatar sx={{ 
          width: 32, 
          height: 32,
          bgcolor: 'primary.main',
          color: 'primary.contrastText'
        }}>
          <ComputerIcon sx={{ fontSize: 20 }} />
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2">
              System
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: nb })}
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
            {comment.body}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export function IssueComments({ issueId, comments, onAddComment, isLoading }: IssueCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(issueId, newComment.trim());
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Kommentarer
      </Typography>
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}

          {comments.length === 0 && (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Ingen kommentarer enda
            </Typography>
          )}
        </>
      )}

      <Paper
        component="form"
        onSubmit={handleSubmit}
        variant="outlined"
        sx={{ p: 2, mt: 2 }}
      >
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Skriv en kommentar..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={isSubmitting}
          sx={{ mb: 1 }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!newComment.trim() || isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Send kommentar'}
        </Button>
      </Paper>
    </Box>
  );
}
