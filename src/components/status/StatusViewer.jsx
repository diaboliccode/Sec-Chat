import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { X, Heart, MessageCircle, Share, Eye, Clock, Send } from 'lucide-react';

export default function StatusViewer({ status, isOpen, onClose, onReact, onReply, onShare }) {
  const [showReactions, setShowReactions] = useState(false);
  const [hasReacted, setHasReacted] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');

  const reactions = ['❤️', '😂', '😮', '😢', '😡', '👍'];

  const handleReaction = (emoji) => {
    setHasReacted(true);
    setShowReactions(false);
    if (onReact) {
      onReact(status.id, emoji);
    }
  };

  const handleReply = () => {
    if (showReplyInput && replyText.trim()) {
      if (onReply) {
        onReply(status, replyText.trim());
      }
      setReplyText('');
      setShowReplyInput(false);
    } else {
      setShowReplyInput(true);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(status);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const formatTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (!isOpen || !status) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative w-full max-w-md h-full max-h-[80vh] bg-black rounded-lg overflow-hidden">
          {status.type === 'photo' ? (
            <div className="relative w-full h-full">
              <img
                src={status.photoUrl}
                alt="Status"
                className="w-full h-full object-cover"
                style={status.filter ? { filter: status.filter } : {}}
              />
              
              {status.content && (
                <div
                  className={`absolute ${status.fontSize} font-bold text-center pointer-events-none`}
                  style={{
                    color: status.textColor,
                    left: `${status.textPosition?.x || 50}%`,
                    top: `${status.textPosition?.y || 50}%`,
                    transform: 'translate(-50%, -50%)',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  {status.content}
                </div>
              )}
            </div>
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center p-6"
              style={{ 
                background: status.gradient ? status.backgroundColor : undefined,
                backgroundColor: !status.gradient ? status.backgroundColor : undefined
              }}
            >
              <p 
                className={`${status.fontSize} font-medium text-center max-w-full break-words`}
                style={{ 
                  color: status.textColor,
                  textAlign: status.textAlign || 'center',
                  fontWeight: status.fontWeight || 'normal'
                }}
              >
                {status.content}
              </p>
            </div>
          )}

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
                  {status.avatar || '👤'}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{status.username || 'You'}</h3>
                  <p className="text-white/80 text-sm">{formatTimeAgo(status.timestamp)}</p>
                </div>
              </div>
              
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            {/* Reply Input */}
            <AnimatePresence>
              {showReplyInput && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mb-4 flex gap-2"
                >
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 bg-black/40 border-white/20 text-white placeholder:text-white/60"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleReply();
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReactions(!showReactions)}
                  className={`text-white hover:bg-white/20 ${hasReacted ? 'text-red-400' : ''}`}
                >
                  <Heart className={`w-5 h-5 mr-1 ${hasReacted ? 'fill-current' : ''}`} />
                  {hasReacted ? 'Liked' : 'Like'}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReply}
                  className="text-white hover:bg-white/20"
                >
                  <MessageCircle className="w-5 h-5 mr-1" />
                  Reply
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-white hover:bg-white/20"
                >
                  <Share className="w-5 h-5 mr-1" />
                  Share
                </Button>
              </div>

              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Eye className="w-4 h-4" />
                <span>{status.views || 0}</span>
              </div>
            </div>

            {/* Reactions */}
            <AnimatePresence>
              {showReactions && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex items-center gap-2 mt-3 bg-black/40 rounded-full p-2"
                >
                  {reactions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(emoji)}
                      className="text-2xl hover:scale-125 transition-transform p-1"
                    >
                      {emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status Info */}
            <div className="flex items-center justify-between mt-3 text-white/60 text-xs">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Expires in {formatTimeRemaining(status.expiresAt)}</span>
              </div>
              <span>{status.type === 'photo' ? 'Photo Status' : 'Text Status'}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute top-16 left-4 right-4">
            <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className="h-full bg-white rounded-full"
                onAnimationComplete={onClose}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tap Areas for Navigation */}
      <div className="absolute inset-0 flex">
        <div className="flex-1" onClick={onClose} />
        <div className="flex-1" onClick={onClose} />
      </div>
    </motion.div>
  );
}