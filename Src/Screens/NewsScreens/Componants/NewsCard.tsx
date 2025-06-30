import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {DText} from '../../../Componants/DText';
import {Blog} from '../Hooks/type';
import images from '../../../Theme/images'; // Import images

interface NewsCardProps {
  blog: Blog;
  onPress?: (blog: Blog) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({blog, onPress}) => {
  return (
    <TouchableOpacity
      style={styles.newsCard}
      onPress={() => onPress?.(blog)}
      activeOpacity={0.7}>
      <View style={styles.cardContent}>
        {/* Image */}
        <Image
          source={blog.image_url ? {uri: blog.image_url} : images.newsPlaceholder}
          style={styles.newsImage}
          defaultSource={images.newsPlaceholder}
        />

        {/* Content */}
        <View style={styles.textContent}>
          {/* Title */}
          <DText
            fontStyle="fontBold"
            style={styles.newsTitle}
            numberOfLines={2}>
            {blog.title}
          </DText>

          {/* Author */}
          <DText fontStyle="fontMedium" style={styles.authorText}>
            By {blog.author_name}
          </DText>

          {/* Tags */}
          <View style={styles.tagsContainer}>
            {blog.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tagChip}>
                <DText style={styles.tagText}>{tag}</DText>
              </View>
            ))}
            {blog.tags.length > 3 && (
              <DText style={styles.moreTagsText}>+{blog.tags.length - 3}</DText>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,

    elevation: 4,
    overflow: 'hidden',
    borderLeftWidth: 3,
    borderLeftColor: '#009D94', // Theme color accent
    marginBottom: 0, // Ensure no extra margin
  },
  cardContent: {
    flexDirection: 'row',
    minHeight: 120, // Ensure consistent height
  },
  newsImage: {
    width: 120,
    height: Platform.OS === 'ios' ? 120 : 124,
    resizeMode: 'cover',
  },
  textContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-start', // Align content to top
  },
  newsTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1A1A1A',
    marginBottom: 8,
    flex: 0, // Don't let title expand
  },
  authorText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    flex: 0, // Don't let author expand
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start', // Align tags to top
    flex: 1, // Allow tags to fill remaining space
    justifyContent: 'flex-start',
  },
  tagChip: {
    backgroundColor: '#E6F7F6', // Light theme color
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#009D94', // Theme color border
    alignSelf: 'flex-start', // Prevent stretching
  },
  tagText: {
    fontSize: 12,
    color: '#009D94', // Theme color text
    fontWeight: '500',
    lineHeight: 16, // Explicit line height
  },
  moreTagsText: {
    fontSize: 12,
    color: '#009D94', // Theme color
    fontStyle: 'italic',
    fontWeight: '500',
    lineHeight: 16, // Explicit line height
    alignSelf: 'flex-start',
  },
});

export default NewsCard;
