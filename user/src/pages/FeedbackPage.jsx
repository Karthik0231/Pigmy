import React, { useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
  Divider,
  Chip,
  IconButton,
  Pagination,
  InputAdornment,
  Card,
  CardContent,
  Tooltip,
  Skeleton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { UserContext } from '../Context/Context';
import SendIcon from '@mui/icons-material/Send';
import FeedbackIcon from '@mui/icons-material/Feedback';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import SearchIcon from '@mui/icons-material/Search';
import BugReportIcon from '@mui/icons-material/BugReport';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ClearIcon from '@mui/icons-material/Clear';
import moment from 'moment';

// Styled Components
const StyledContainer = styled(Container)(({ theme }) => ({
  maxWidth: '100% !important',
  padding: '24px',
  margin: 0,
  [theme.breakpoints.down('sm')]: {
    padding: '16px',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '24px',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  backgroundColor: '#ffffff',
  [theme.breakpoints.down('sm')]: {
    padding: '16px',
  },
}));

const FormBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  marginTop: '16px',
}));

const FeedbackCard = styled(Card)(({ theme }) => ({
  marginBottom: '16px',
  borderRadius: '6px',
  border: '1px solid #e0e0e0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  '&:hover': {
    borderColor: '#d0d0d0',
  },
}));

const SearchBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '16px',
  marginBottom: '24px',
  flexWrap: 'wrap',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: '12px',
  },
}));

const StatsGrid = styled(Grid)(({ theme }) => ({
  marginBottom: '24px',
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: '16px',
  textAlign: 'center',
  borderRadius: '6px',
  backgroundColor: '#fafafa',
  border: '1px solid #e0e0e0',
}));

const ITEMS_PER_PAGE = 6;

// Utility functions
const getTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'complaint':
      return <BugReportIcon sx={{ fontSize: 18, color: '#666' }} />;
    case 'suggestion':
      return <LightbulbIcon sx={{ fontSize: 18, color: '#666' }} />;
    default:
      return <FeedbackIcon sx={{ fontSize: 18, color: '#666' }} />;
  }
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'resolved':
      return 'success';
    case 'pending':
      return 'default';
    case 'in-progress':
      return 'primary';
    default:
      return 'default';
  }
};

// Loading skeleton component
const FeedbackSkeleton = () => (
  <>
    {[...Array(3)].map((_, index) => (
      <Card key={index} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
        <CardContent>
          <Stack spacing={1}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="100%" height={20} />
            <Skeleton variant="text" width="80%" height={20} />
            <Stack direction="row" spacing={2}>
              <Skeleton variant="text" width={100} height={16} />
              <Skeleton variant="text" width={80} height={16} />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    ))}
  </>
);

export default function FeedbackPage() {
  const { loading, error, success, submitCustomerFeedback, clearMessages, fetchCustomerFeedbacks } = useContext(UserContext);

  // Form state
  const [feedbackType, setFeedbackType] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [formError, setFormError] = useState('');

  // Feedback data state
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);

  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch feedbacks on component mount
  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        setFeedbackLoading(true);
        const data = await fetchCustomerFeedbacks();
        setFeedbacks(data || []);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        setFeedbacks([]);
      } finally {
        setFeedbackLoading(false);
      }
    };
    loadFeedbacks();
  }, [fetchCustomerFeedbacks]);

  // Memoized filtered and sorted feedbacks
  const filteredAndSortedFeedbacks = useMemo(() => {
    let filtered = feedbacks.filter((feedback) => {
      const matchesSearch = 
        feedback.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.type?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = !filterType || feedback.type === filterType;
      const matchesStatus = !filterStatus || feedback.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort feedbacks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'rating-high':
          return (b.rating || 0) - (a.rating || 0);
        case 'rating-low':
          return (a.rating || 0) - (b.rating || 0);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return filtered;
  }, [feedbacks, searchTerm, filterType, filterStatus, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedFeedbacks.length / ITEMS_PER_PAGE);
  const paginatedFeedbacks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedFeedbacks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedFeedbacks, currentPage]);

  // Statistics
  const stats = useMemo(() => {
    const total = feedbacks.length;
    const complaints = feedbacks.filter(f => f.type === 'Complaint').length;
    const suggestions = feedbacks.filter(f => f.type === 'Suggestion').length;
    const resolved = feedbacks.filter(f => f.status === 'resolved').length;
    const avgRating = feedbacks.length > 0 
      ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.filter(f => f.rating > 0).length || 0).toFixed(1)
      : 0;
    
    return { total, complaints, suggestions, resolved, avgRating };
  }, [feedbacks]);

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

    const result = await submitCustomerFeedback(feedbackData);

    if (result.success) {
      // Clear form on success
      setFeedbackType('');
      setSubject('');
      setContent('');
      setRating(0);

      // Refresh feedbacks list
      const updatedFeedbacks = await fetchCustomerFeedbacks();
      setFeedbacks(updatedFeedbacks || []);
      setCurrentPage(1);
    }
  };

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterType('');
    setFilterStatus('');
    setSortBy('newest');
    setCurrentPage(1);
  }, []);

  return (
    <StyledContainer>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: '#333', mb: 1 }}>
          Customer Feedback
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Submit and manage your feedback
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Feedback Form */}
        <Grid item xs={12} md={4} sx={{width:'500px'}}>
          <StyledPaper>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#333' }}>
              Submit New Feedback
            </Typography>

            <form onSubmit={handleSubmit}>
              <FormBox>
                <FormControl fullWidth required>
                  <InputLabel>Feedback Type</InputLabel>
                  <Select
                    value={feedbackType}
                    label="Feedback Type"
                    onChange={(e) => setFeedbackType(e.target.value)}
                  >
                    <MenuItem value="">Select Type</MenuItem>
                    <MenuItem value="Complaint">Complaint</MenuItem>
                    <MenuItem value="Suggestion">Suggestion</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Subject (Optional)"
                  variant="outlined"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  inputProps={{ maxLength: 100 }}
                  helperText={`${subject.length}/100`}
                />

                <TextField
                  fullWidth
                  label="Feedback Content"
                  variant="outlined"
                  multiline
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  inputProps={{ maxLength: 1000 }}
                  helperText={`${content.length}/1000`}
                />

                <Box>
                  <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                    Rating (Optional)
                  </Typography>
                  <Rating
                    value={rating}
                    onChange={(event, newValue) => setRating(newValue)}
                    size="medium"
                  />
                </Box>

                {formError && (
                  <Alert severity="error" onClose={() => setFormError('')}>
                    {formError}
                  </Alert>
                )}

                {error && (
                  <Alert severity="error" onClose={clearMessages}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" onClose={clearMessages}>
                    {success}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                  disabled={loading}
                  sx={{ 
                    mt: 1,
                    py: 1.2,
                    backgroundColor: '#1976d2',
                    '&:hover': { backgroundColor: '#1565c0' }
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </FormBox>
            </form>
          </StyledPaper>
        </Grid>

        {/* Feedback History */}
        <Grid item xs={12} md={8} sx={{width:'550px'}}>
          <StyledPaper>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                Feedback History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredAndSortedFeedbacks.length} of {stats.total} items
              </Typography>
            </Stack>

            {/* Statistics */}
            {/* <StatsGrid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <StatCard>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                    {stats.complaints}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Complaints
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                    {stats.suggestions}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Suggestions
                  </Typography>
                </StatCard>
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard>
                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                    <StarIcon sx={{ fontSize: 14, color: '#666' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                      {stats.avgRating}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Avg Rating
                  </Typography>
                </StatCard>
              </Grid>
            </StatsGrid> */}

            {/* Search and Filter */}
            <SearchBox>
              <TextField
                placeholder="Search feedback..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1, minWidth: 200 }}
              />
              
              <FormControl size="small" sx={{ minWidth:'100%' }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  label="Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="Complaint">Complaints</MenuItem>
                  <MenuItem value="Suggestion">Suggestions</MenuItem>
                </Select>
              </FormControl>
{/* 
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="oldest">Oldest</MenuItem>
                  <MenuItem value="rating-high">Rating ↓</MenuItem>
                  <MenuItem value="rating-low">Rating ↑</MenuItem>
                  <MenuItem value="type">Type</MenuItem>
                </Select>
              </FormControl> */}

              <Button
                onClick={handleClearFilters}
                variant="outlined"
                size="small"
                sx={{ minWidth: 'auto' }}
              >
                Clear
              </Button>
            </SearchBox>

            {/* Feedback List */}
            {feedbackLoading ? (
              <FeedbackSkeleton />
            ) : filteredAndSortedFeedbacks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <FeedbackIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {feedbacks.length === 0 ? 'No feedback yet' : 'No matching results'}
                </Typography>
                <Typography variant="body2" color="text.disabled">
                  {feedbacks.length === 0 
                    ? 'Submit your first feedback using the form'
                    : 'Try adjusting your search criteria'
                  }
                </Typography>
              </Box>
            ) : (
              <>
                <Box>
                  {paginatedFeedbacks.map((feedback, index) => (
                    <FeedbackCard key={feedback._id}>
                      <CardContent sx={{ py: 2 }}>
                        <Stack spacing={2}>
                          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={1}>
                              {getTypeIcon(feedback.type)}
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {feedback.type}
                                {feedback.subject && ` - ${feedback.subject}`}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                              <Chip 
                                label={feedback.status || 'Pending'} 
                                color={getStatusColor(feedback.status)}
                                size="small"
                                variant="outlined"
                              />
                              {feedback.rating > 0 && (
                                <Chip
                                  icon={<StarIcon sx={{ fontSize: 12 }} />}
                                  label={`${feedback.rating}/5`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Stack>
                          </Stack>

                          <Typography 
                            variant="body2" 
                            color="text.primary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.4,
                            }}
                          >
                            {feedback.content}
                          </Typography>

                          {feedback.notes ?

                          <Typography variant="body2" color="text.primary">
                            Reply:{feedback.notes}
                          </Typography>
                          : null  
                        }

                          <Stack 
                            direction="row" 
                            alignItems="center" 
                            justifyContent="space-between"
                            sx={{ pt: 1, borderTop: '1px solid #f0f0f0' }}
                          >
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <AccessTimeIcon sx={{ fontSize: 12, color: '#999' }} />
                              <Typography variant="caption" color="text.disabled">
                                {moment(feedback.createdAt).format('MMM DD, YYYY')}
                              </Typography>
                            </Stack>
                            <Typography variant="caption" color="text.disabled">
                              #{feedback._id?.slice(-6)}
                            </Typography>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </FeedbackCard>
                  ))}
                </Box>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={(event, page) => setCurrentPage(page)}
                      color="primary"
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