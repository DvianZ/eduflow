import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { WebView } from 'react-native-webview';

interface InlineVideoPlayerProps {
  videoUrl?: string;
  title?: string;
  posterUrl?: string;
}

/**
 * Extracts YouTube video ID from various standard YouTube URL formats
 */
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const regExp =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

/**
 * Extracts Vimeo video ID from Vimeo URLs
 */
function getVimeoId(url: string): string | null {
  if (!url) return null;
  const regExp =
    /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+))/;
  const match = url.match(regExp);
  return match ? match[3] : null;
}

export function InlineVideoPlayer({
  videoUrl,
  title,
  posterUrl,
}: InlineVideoPlayerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!videoUrl || !videoUrl.trim()) {
    return (
      <View
        style={[
          styles.emptyContainer,
          { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' },
        ]}>
        <Ionicons name="videocam-outline" size={32} color="#94A3B8" />
        <Text style={[styles.emptyText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
          Tautan video belum disematkan pada materi ini.
        </Text>
      </View>
    );
  }

  const trimmedUrl = videoUrl.trim();
  const youtubeId = getYouTubeId(trimmedUrl);
  const vimeoId = getVimeoId(trimmedUrl);

  const isYouTube = !!youtubeId;
  const isVimeo = !!vimeoId;

  const isWeb = Platform.OS === 'web';

  // Resolve player badge
  const sourceBadge = isYouTube
    ? { icon: 'logo-youtube', label: 'YouTube In-App HD', color: '#EF4444' }
    : isVimeo
    ? { icon: 'videocam', label: 'Vimeo In-App', color: '#0EA5E9' }
    : { icon: 'film', label: 'Pemutar Video Langsung', color: '#10B981' };

  return (
    <View
      style={[
        styles.playerWrapper,
        {
          backgroundColor: '#000000',
          borderColor: isDark ? '#334155' : '#0F172A',
        },
      ]}>
      {/* Top Source Info Bar */}
      <View style={styles.topInfoBar}>
        <View style={styles.badgePill}>
          <Ionicons
            name={sourceBadge.icon as any}
            size={12}
            color={sourceBadge.color}
          />
          <Text style={[styles.badgeText, { color: sourceBadge.color }]}>
            {sourceBadge.label}
          </Text>
        </View>
        <Text style={styles.inlineNoticeText}>
          Putar Langsung Tanpa Pindah Layar
        </Text>
      </View>

      {/* Main Video Screen Container */}
      <View style={styles.videoSurface}>
        {isWeb ? (
          /* Web Native Video / iFrame Embed */
          isYouTube ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`}
              title={title || 'Video Lecture'}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#000000',
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : isVimeo ? (
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}?playsinline=1&title=0&byline=0`}
              title={title || 'Video Lecture'}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#000000',
              }}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              controls
              playsInline
              controlsList="nodownload"
              poster={posterUrl}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#000000',
                objectFit: 'contain',
              }}
              src={trimmedUrl}>
              <track kind="captions" />
              Browser Anda tidak mendukung pemutar video HTML5.
            </video>
          )
        ) : (
          /* Native Platform (iOS / Android) WebView Embed */
          isYouTube ? (
            <WebView
              source={{
                uri: `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`,
              }}
              allowsFullscreenVideo
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              style={{ flex: 1, backgroundColor: '#000000' }}
            />
          ) : isVimeo ? (
            <WebView
              source={{
                uri: `https://player.vimeo.com/video/${vimeoId}?playsinline=1`,
              }}
              allowsFullscreenVideo
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              style={{ flex: 1, backgroundColor: '#000000' }}
            />
          ) : (
            <WebView
              source={{
                html: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"><style>body{margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;}video{width:100%;max-height:100%;object-fit:contain;}</style></head><body><video controls playsinline autoplay src="${trimmedUrl}"></video></body></html>`,
              }}
              allowsFullscreenVideo
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              style={{ flex: 1, backgroundColor: '#000000' }}
            />
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  playerWrapper: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    marginVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  topInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  inlineNoticeText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  videoSurface: {
    width: '100%',
    aspectRatio: 16 / 9,
    minHeight: 210,
    maxHeight: 340,
    backgroundColor: '#000000',
    position: 'relative',
  },
  emptyContainer: {
    width: '100%',
    padding: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
