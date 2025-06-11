import React, { useContext, useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  TextField,
  Button,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Rating,
  Stack,
  Fade,
  Grid,
  List,
  ListItem,
  ListItemText,
  Pagination,
  InputAdornment,
  Chip,
  IconButton,
  Collapse,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { CollectorContext } from '../Context/Context';
import SendIcon from '@mui/icons-material/Send';
import FeedbackIcon from '@mui/icons-material/Feedback';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import SubjectIcon from '@mui/icons-material/Subject';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import moment from 'moment';

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow: 'none',
}));

const FormBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2.5),
  marginTop: theme.spacing(2),
}));

const FeedbackItem = styled(ListItem)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingY: theme.spacing(2),
  paddingX: 0,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const FeedbackContent = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  color: theme.palette.text.primary,
}));

const FeedbackMeta = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginTop: theme.spacing(1.5),
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
}));

const FilterBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  alignItems: 'center',
  flexWrap: 'wrap',
}));

const ITEMS_PER_PAGE = 10;

export default function FeedbackPage() {
  const { loading, error, success, submitCollectorFeedback, clearMessages, fetchCollectorFeedbacks } = useContext(CollectorContext);

  // Form state
  const [feedbackType, setFeedbackType] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [formError, setFormError] = useState('');

  // Feedback list state
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());

  // Fetch feedbacks on component mount
  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        setFeedbackLoading(true);
        const data = await fetchCollectorFeedbacks();
        setFeedbacks(data || []);
      } catch (error) {
        console.error('Error fetching collector feedbacks:', error);
        setFeedbacks([]);
      } finally {
        setFeedbackLoading(false);
      }
    };
    loadFeedbacks();
  }, [fetchCollectorFeedbacks]);

  // Filtered and paginated feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(feedback => {
      const matchesSearch = !searchTerm || 
        feedback.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (feedback.subject && feedback.subject.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = !typeFilter || feedback.type === typeFilter;
      const matchesStatus = !statusFilter || feedback.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [feedbacks, searchTerm, typeFilter, statusFilter]);

  const paginatedFeedbacks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFeedbacks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredFeedbacks, currentPage]);

  const totalPages = Math.ceil(filteredFeedbacks.length / ITEMS_PER_PAGE);

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearMessages();
    setFormError('');

    if (!feedbackType || !content) {
      setFormError('Feedback type and content are required.');
      return;
    }

    const feedbackData = {
      type: feedbackType,
      subject: subject.trim() === '' ? undefined : subject,
      content,
      rating: rating > 0 ? rating : undefined,
    };

    const result = await submitCollectorFeedback(feedbackData);

    if (result.success) {
      setFeedbackType('');
      setSubject('');
      setContent('');
      setRating(0);

      const updatedFeedbacks = await fetchCollectorFeedbacks();
      setFeedbacks(updatedFeedbacks || []);
      setCurrentPage(1);
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const toggleExpanded = (feedbackId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(feedbackId)) {
        newSet.delete(feedbackId);
      } else {
        newSet.add(feedbackId);
      }
      return newSet;
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'default';
      case 'reviewed': return 'primary';
      case 'resolved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const truncateText = (text, limit = 150) => {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + '...';
  };

  return (
    <StyledContainer maxWidth="xl">
      <Grid container spacing={3}>
        {/* Feedback Form */}
        <Grid item xs={12} lg={5}>
          <StyledPaper>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <FeedbackIcon sx={{ fontSize: 28, color: 'text.secondary' }} />
              <Typography variant="h6" component="h1" fontWeight={600}>
                Submit Feedback
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Share your thoughts, suggestions, or report issues to help us improve.
            </Typography>

            <form onSubmit={handleSubmit}>
              <FormBox>
                <FormControl fullWidth required size="small">
                  <InputLabel>Feedback Type</InputLabel>
                  <Select
                    value={feedbackType}
                    label="Feedback Type"
                    onChange={(e) => setFeedbackType(e.target.value)}
                  >
                    <MenuItem value="Complaint">Complaint</MenuItem>
                    <MenuItem value="Suggestion">Suggestion</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Subject (Optional)"
                  variant="outlined"
                  size="small"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  inputProps={{ maxLength: 100 }}
                />

                <TextField
                  fullWidth
                  label="Your Feedback"
                  variant="outlined"
                  multiline
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Rating (Optional):
                  </Typography>
                  <Rating
                    name="feedback-rating"
                    value={rating}
                    onChange={(event, newValue) => setRating(newValue)}
                    size="small"
                  />
                </Box>

                {formError && (
                  <Alert severity="error" onClose={() => setFormError('')}>
                    {formError}
                  </Alert>
                )}

                {error && (
                  <Fade in={!!error}>
                    <Alert severity="error" onClose={clearMessages}>
                      {error}
                    </Alert>
                  </Fade>
                )}

                {success && (
                  <Fade in={!!success}>
                    <Alert severity="success" onClose={clearMessages}>
                      {success}
                    </Alert>
                  </Fade>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                  disabled={loading}
                  sx={{ 
                    mt: 1,
                    bgcolor: 'grey.800',
                    '&:hover': { bgcolor: 'grey.900' }
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </FormBox>
            </form>
          </StyledPaper>
        </Grid>

        {/* Feedback History */}
        <Grid item xs={12} lg={7}>
          <StyledPaper>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <AccessTimeIcon sx={{ fontSize: 28, color: 'text.secondary' }} />
                <Typography variant="h6" component="h2" fontWeight={600}>
                  Feedback History
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {filteredFeedbacks.length} {filteredFeedbacks.length === 1 ? 'item' : 'items'}
              </Typography>
            </Stack>

            {/* Filters */}
            <FilterBar>
              <TextField
                size="small"
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 200 }}
              />
              
              <Select
                size="small"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                displayEmpty
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="Complaint">Complaint</MenuItem>
                <MenuItem value="Suggestion">Suggestion</MenuItem>
              </Select>


              {(searchTerm || typeFilter || statusFilter) && (
                <Button size="small" onClick={resetFilters} variant="outlined" color="inherit">
                  Clear Filters
                </Button>
              )}
            </FilterBar>

            {feedbackLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredFeedbacks.length === 0 ? (
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                {feedbacks.length === 0 ? 'No feedback submitted yet.' : 'No feedback matches your filters.'}
              </Typography>
            ) : (
              <>
                <List sx={{ p: 0 }}>
                  {paginatedFeedbacks.map((feedback) => {
                    const isExpanded = expandedItems.has(feedback._id);
                    const shouldTruncate = feedback.content.length > 150;
                    
                    return (
                      <FeedbackItem key={feedback._id} alignItems="flex-start">
                        <ListItemText
                          primary={
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {feedback.type} {feedback.subject ? `- ${feedback.subject}` : ''}
                              </Typography>
                              <Chip 
                                label={feedback.status} 
                                size="small" 
                                color={getStatusColor(feedback.status)}
                                variant="outlined"
                              />
                            </Stack>
                          }
                          secondary={
                            <>
                              <FeedbackContent>
                                <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                                  {shouldTruncate && !isExpanded 
                                    ? truncateText(feedback.content)
                                    : feedback.content
                                  }
                                  {shouldTruncate && (
                                    <IconButton
                                      size="small"
                                      onClick={() => toggleExpanded(feedback._id)}
                                      sx={{ ml: 1, p: 0.5 }}
                                    >
                                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>
                                  )}
                                </Typography>
                                 {feedback.notes ?
                                
                                                          <Typography variant="body2" color="text.primary">
                                                            Reply:{feedback.notes}
                                                          </Typography>
                                                          : null  
                                                        }
                              </FeedbackContent>
                              <FeedbackMeta>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <AccessTimeIcon sx={{ fontSize: 12 }} />
                                  <Typography variant="caption">
                                    {moment(feedback.createdAt).format('MMM DD, YYYY HH:mm')}
                                  </Typography>
                                </Stack>
                                {feedback.rating > 0 && (
                                  <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <StarIcon sx={{ fontSize: 12 }} />
                                    <Typography variant="caption">{feedback.rating}/5</Typography>
                                  </Stack>
                                )}
                              </FeedbackMeta>
                            </>
                          }
                        />
                      </FeedbackItem>
                    );
                  })}
                </List>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      size="small"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </>
            )}
          </StyledPaper>
        </Grid>
      </Grid>
    </StyledContainer>
  );
}