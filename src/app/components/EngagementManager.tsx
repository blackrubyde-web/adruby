import { useState } from 'react';
import { MessageCircle, Heart, Reply, Trash2, Flag, Clock, Filter, Search, AlertCircle, Smile, Frown, Meh, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

interface Comment {
  id: string;
  campaignId: string;
  campaignName: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: string;
  likes: number;
  hasReplied: boolean;
  isHidden: boolean;
  replies: {
    id: string;
    author: string;
    content: string;
    timestamp: string;
  }[];
}

export function EngagementManager() {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      campaignId: 'camp1',
      campaignName: 'Summer Sale Campaign',
      author: {
        name: 'Sarah Miller',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
      },
      content: 'Love this product! Just ordered mine. Fast shipping would be great!',
      sentiment: 'positive',
      timestamp: '5 minutes ago',
      likes: 12,
      hasReplied: false,
      isHidden: false,
      replies: []
    },
    {
      id: '2',
      campaignId: 'camp1',
      campaignName: 'Summer Sale Campaign',
      author: {
        name: 'Michael Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
      },
      content: 'Is this available in blue? I don\'t see it in the options.',
      sentiment: 'neutral',
      timestamp: '12 minutes ago',
      likes: 3,
      hasReplied: true,
      isHidden: false,
      replies: [
        {
          id: 'r1',
          author: 'Your Brand',
          content: 'Hi Michael! Yes, we have blue available. Please check the dropdown menu on the product page. Let us know if you need help!',
          timestamp: '8 minutes ago'
        }
      ]
    },
    {
      id: '3',
      campaignId: 'camp2',
      campaignName: 'Black Friday Flash Sale',
      author: {
        name: 'Emma Wilson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
      },
      content: 'The quality is not as expected. Disappointed with my purchase.',
      sentiment: 'negative',
      timestamp: '1 hour ago',
      likes: 8,
      hasReplied: true,
      isHidden: false,
      replies: [
        {
          id: 'r2',
          author: 'Your Brand',
          content: 'We\'re sorry to hear that, Emma. We\'d like to make this right. Please DM us your order number and we\'ll arrange a replacement or refund.',
          timestamp: '45 minutes ago'
        }
      ]
    },
    {
      id: '4',
      campaignId: 'camp3',
      campaignName: 'Product Launch',
      author: {
        name: 'David Brown',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
      },
      content: 'When will this be back in stock? I\'ve been waiting for weeks!',
      sentiment: 'neutral',
      timestamp: '2 hours ago',
      likes: 15,
      hasReplied: false,
      isHidden: false,
      replies: []
    },
    {
      id: '5',
      campaignId: 'camp1',
      campaignName: 'Summer Sale Campaign',
      author: {
        name: 'Lisa Anderson',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100'
      },
      content: 'Amazing deal! Already recommended to 3 friends 🔥',
      sentiment: 'positive',
      timestamp: '3 hours ago',
      likes: 24,
      hasReplied: true,
      isHidden: false,
      replies: [
        {
          id: 'r3',
          author: 'Your Brand',
          content: 'Thank you so much, Lisa! We appreciate you spreading the word ❤️',
          timestamp: '2 hours ago'
        }
      ]
    }
  ]);

  const [selectedSentiment, setSelectedSentiment] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'replied' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const filteredComments = comments.filter(comment => {
    const matchesSentiment = selectedSentiment === 'all' || comment.sentiment === selectedSentiment;
    const matchesStatus = selectedStatus === 'all' ||
                         (selectedStatus === 'replied' && comment.hasReplied) ||
                         (selectedStatus === 'pending' && !comment.hasReplied);
    const matchesSearch = comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         comment.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSentiment && matchesStatus && matchesSearch;
  });

  const stats = {
    total: comments.length,
    pending: comments.filter(c => !c.hasReplied).length,
    positive: comments.filter(c => c.sentiment === 'positive').length,
    negative: comments.filter(c => c.sentiment === 'negative').length,
    avgResponseTime: '12 min'
  };

  const handleReply = (commentId: string) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setComments(prev => prev.map(comment =>
      comment.id === commentId
        ? {
            ...comment,
            hasReplied: true,
            replies: [
              ...comment.replies,
              {
                id: Date.now().toString(),
                author: 'Your Brand',
                content: replyText,
                timestamp: 'Just now'
              }
            ]
          }
        : comment
    ));

    setReplyingTo(null);
    setReplyText('');
    toast.success('✅ Reply posted successfully!');
  };

  const handleHide = (commentId: string) => {
    setComments(prev => prev.map(comment =>
      comment.id === commentId ? { ...comment, isHidden: !comment.isHidden } : comment
    ));
    toast.success('Comment visibility updated');
  };

  const handleDelete = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    toast.success('Comment deleted');
  };

  const getSentimentIcon = (sentiment: Comment['sentiment']) => {
    switch (sentiment) {
      case 'positive': return Smile;
      case 'negative': return Frown;
      case 'neutral': return Meh;
    }
  };

  const getSentimentColor = (sentiment: Comment['sentiment']) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500 bg-green-500/20';
      case 'negative': return 'text-red-500 bg-red-500/20';
      case 'neutral': return 'text-blue-500 bg-blue-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Engagement & Comment Manager</h2>
        <p className="text-muted-foreground">
          Manage and respond to comments across all campaigns
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Comments</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">{stats.pending}</div>
          <div className="text-sm text-muted-foreground">Need Reply</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">{stats.positive}</div>
          <div className="text-sm text-muted-foreground">Positive</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">{stats.negative}</div>
          <div className="text-sm text-muted-foreground">Negative</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-transparent border border-border/30">
          <div className="text-2xl text-foreground font-bold mb-1">{stats.avgResponseTime}</div>
          <div className="text-sm text-muted-foreground">Avg Response</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search comments..."
              className="pl-10 bg-input border-border text-foreground"
            />
          </div>

          {/* Sentiment Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {(['all', 'positive', 'negative', 'neutral'] as const).map((sentiment) => (
              <button
                key={sentiment}
                onClick={() => setSelectedSentiment(sentiment)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedSentiment === sentiment
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            {(['all', 'replied', 'pending'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedStatus === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">No comments found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
          </div>
        ) : (
          filteredComments.map((comment) => {
            const SentimentIcon = getSentimentIcon(comment.sentiment);
            const isReplying = replyingTo === comment.id;

            return (
              <div
                key={comment.id}
                className={`bg-card border rounded-xl p-5 transition-all hover:shadow-lg ${
                  !comment.hasReplied ? 'border-orange-500/30 bg-orange-500/5' : 'border-border'
                }`}
              >
                {/* Comment Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{comment.author.name}</h4>
                        <div className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${getSentimentColor(comment.sentiment)}`}>
                          <SentimentIcon className="w-3 h-3" />
                          <span className="text-xs font-medium capitalize">{comment.sentiment}</span>
                        </div>
                        {!comment.hasReplied && (
                          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-500 rounded-full text-xs font-medium flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Needs Reply
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{comment.campaignName}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{comment.timestamp}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{comment.likes} likes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="ml-13 mb-3">
                  <p className="text-foreground">{comment.content}</p>
                </div>

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="ml-13 mb-3 space-y-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="bg-muted/50 rounded-lg p-3 border-l-2 border-primary">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground text-sm">{reply.author}</span>
                          <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                        </div>
                        <p className="text-sm text-foreground">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {isReplying && (
                  <div className="ml-13 mb-3 animate-in fade-in slide-in-from-top-2">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      rows={3}
                      className="bg-input border-border text-foreground mb-2"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleReply(comment.id)}
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Reply className="w-3 h-3 mr-1" />
                        Post Reply
                      </Button>
                      <Button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        size="sm"
                        variant="outline"
                        className="border-border text-foreground hover:bg-muted"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 ml-13">
                  {!isReplying && (
                    <Button
                      onClick={() => setReplyingTo(comment.id)}
                      size="sm"
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                  )}
                  <Button
                    onClick={() => handleHide(comment.id)}
                    size="sm"
                    variant="outline"
                    className="border-border text-foreground hover:bg-muted"
                  >
                    {comment.isHidden ? 'Unhide' : 'Hide'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border text-foreground hover:bg-muted"
                  >
                    <Flag className="w-3 h-3 mr-1" />
                    Flag
                  </Button>
                  <Button
                    onClick={() => handleDelete(comment.id)}
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Response Templates */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Quick Response Templates</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Thank you!', text: 'Thank you so much for your support! We really appreciate it ❤️' },
            { label: 'Shipping Info', text: 'We ship within 24-48 hours. You\'ll receive a tracking number via email.' },
            { label: 'Resolve Issue', text: 'We\'re sorry to hear that. Please DM us your order number so we can help resolve this.' },
          ].map((template) => (
            <button
              key={template.label}
              onClick={() => setReplyText(template.text)}
              className="p-3 border border-border rounded-lg hover:border-primary transition-all hover:bg-primary/5 text-left"
            >
              <div className="font-medium text-foreground text-sm mb-1">{template.label}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">{template.text}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
