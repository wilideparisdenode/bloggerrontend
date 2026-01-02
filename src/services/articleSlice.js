import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API } from './api';

// Async thunks for article operations
export const fetchArticles = createAsyncThunk(
  'articles/fetchArticles',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await API.getArticles(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchArticleById = createAsyncThunk(
  'articles/fetchArticleById',
  async (articleId, { rejectWithValue }) => {
    try {
      const response = await API.getArticleById(articleId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createArticle = createAsyncThunk(
  'articles/createArticle',
  async (articleData, { rejectWithValue }) => {
    try {
      const response = await API.createArticle(articleData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateArticle = createAsyncThunk(
  'articles/updateArticle',
  async ({ articleId, articleData }, { rejectWithValue }) => {
    try {
      const response = await API.updateArticle(articleId, articleData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteArticle = createAsyncThunk(
  'articles/deleteArticle',
  async (articleId, { rejectWithValue }) => {
    try {
      await API.deleteArticle(articleId);
      return articleId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const likeArticle = createAsyncThunk(
  'articles/likeArticle',
  async (articleId, { rejectWithValue }) => {
    try {
      const response = await API.like(articleId);
      return { articleId, ...response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addComment = createAsyncThunk(
  'articles/addComment',
  async ({ articleId, comment }, { rejectWithValue }) => {
    try {
      const response = await API.comment(articleId, comment);
      return { articleId, comment: response.comment };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const articleSlice = createSlice({
  name: 'articles',
  initialState: {
    articles: [],
    currentArticle: null,
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalArticles: 0
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentArticle: (state) => {
      state.currentArticle = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch articles
      .addCase(fetchArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload.articles || [];
        state.pagination = {
          currentPage: action.payload.currentPage || 1,
          totalPages: action.payload.totalPages || 1,
          totalArticles: action.payload.totalArticles || 0
        };
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch article by ID
      .addCase(fetchArticleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentArticle = action.payload;
      })
      .addCase(fetchArticleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create article
      .addCase(createArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.articles.unshift(action.payload.article);
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update article
      .addCase(updateArticle.fulfilled, (state, action) => {
        const index = state.articles.findIndex(
          article => article._id === action.payload.article._id
        );
        if (index !== -1) {
          state.articles[index] = action.payload.article;
        }
        if (state.currentArticle?._id === action.payload.article._id) {
          state.currentArticle = action.payload.article;
        }
      })
      // Delete article
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.articles = state.articles.filter(
          article => article._id !== action.payload
        );
        if (state.currentArticle?._id === action.payload) {
          state.currentArticle = null;
        }
      })
      // Like article
      .addCase(likeArticle.fulfilled, (state, action) => {
        const { articleId, likes, liked } = action.payload;
        const article = state.articles.find(a => a._id === articleId);
        if (article) {
          article.likes = likes;
        }
        if (state.currentArticle?._id === articleId) {
          state.currentArticle.likes = likes;
        }
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        const { articleId, comment } = action.payload;
        if (state.currentArticle?._id === articleId) {
          if (!state.currentArticle.comments) {
            state.currentArticle.comments = [];
          }
          state.currentArticle.comments.push(comment);
        }
      });
  }
});

export const { clearError, clearCurrentArticle } = articleSlice.actions;
export default articleSlice.reducer;


