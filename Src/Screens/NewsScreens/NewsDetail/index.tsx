import React, {JSX} from 'react';
import {Header} from '@rneui/base';
import {
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
  Platform,
  useWindowDimensions,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import {DText} from '../../../components/DText';
import {navigateBack} from '../../../utils/navigationService';
import images from '../../../Theme/images';
import {useBlogById} from '../Hooks/NewsGraphql';
import {StyleSheet} from 'react-native';

// Theme color
const THEME_COLOR = '#009D94';

// Define interfaces
interface StakeProps {
  route: {
    params: {
      blogID: string;
    };
  };
}

// HTML rendering configuration
const htmlConfig = {
  defaultTextProps: {
    style: {
      fontSize: 16,
      lineHeight: 24,
      color: '#333333',
      fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
  },
  tagsStyles: {
    p: {
      marginBottom: 12,
      textAlign: 'justify' as const,
    },
    h1: {
      fontSize: 24,
      fontWeight: 'bold' as const,
      color: '#1A1A1A',
      marginBottom: 16,
    },
    h2: {
      fontSize: 20,
      fontWeight: 'bold' as const,
      color: '#1A1A1A',
      marginBottom: 12,
    },
    h3: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: '#1A1A1A',
      marginBottom: 8,
    },
    strong: {
      fontWeight: 'bold' as const,
      color: '#1A1A1A',
    },
    em: {
      fontStyle: 'italic' as const,
    },
    a: {
      color: THEME_COLOR,
      textDecorationLine: 'underline' as const,
    },
    ul: {
      marginBottom: 12,
    },
    ol: {
      marginBottom: 12,
    },
    li: {
      marginBottom: 4,
    },
  },
};

const LoadingState: React.FC = () => (
  <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
    <View style={styles.loadingImageContainer}>
      <View style={styles.loadingImage} />
    </View>
    <View style={styles.contentContainer}>
      <View style={styles.loadingTitle} />
      <View style={styles.loadingAuthor} />
      <View style={styles.loadingTagsContainer}>
        <View style={styles.loadingTag} />
        <View style={styles.loadingTag} />
        <View style={styles.loadingTag} />
      </View>
      <View style={styles.loadingContentLine} />
      <View style={styles.loadingContentLine} />
      <View style={styles.loadingContentLine} />
      <View
        style={[styles.loadingContentLine, styles.loadingContentLineShort]}
      />
    </View>
  </ScrollView>
);

const ErrorState: React.FC<{error: any; onRetry: () => void}> = ({
  error,
  onRetry,
}) => (
  <View style={styles.errorContainer}>
    <View style={styles.errorIconContainer}>
      <DText style={styles.errorIcon}>⚠️</DText>
    </View>
    <DText fontStyle="fontBold" style={styles.errorTitle}>
      Failed to load article
    </DText>
    <DText style={styles.errorSubtitle}>
      {error?.message || 'Something went wrong'}
    </DText>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <DText style={styles.retryText}>Try Again</DText>
    </TouchableOpacity>
  </View>
);

function NewsDetail(props: StakeProps): JSX.Element {
  const {blogID} = props.route.params;
  const {width} = useWindowDimensions();

  const {loading, data: blog, error, refetch} = useBlogById(blogID);

  const renderContent = () => {
    if (loading) {
      return <LoadingState />;
    }

    if (error) {
      return <ErrorState error={error} onRetry={refetch} />;
    }

    if (!blog) {
      return (
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <DText style={styles.errorIcon}>📰</DText>
          </View>
          <DText fontStyle="fontBold" style={styles.errorTitle}>
            Article not found
          </DText>
          <DText style={styles.errorSubtitle}>
            This article may have been removed
          </DText>
        </View>
      );
    }

    // Process content for HTML rendering
    const htmlContent = blog.content || '<p>No content available</p>';

    return (
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            colors={[THEME_COLOR]}
            tintColor={THEME_COLOR}
          />
        }>
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={
              blog.image_url ? {uri: blog.image_url} : images.newsPlaceholder
            }
            style={styles.heroImage}
            defaultSource={images.newsPlaceholder}
          />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Theme color accent bar */}
          <View style={styles.accentBar} />

          {/* Author */}
          <View style={styles.metaContainer}>
            <View style={styles.authorContainer}>
              <View style={styles.authorAvatar}>
                <DText style={styles.authorInitial}>
                  {blog.author_name?.charAt(0)?.toUpperCase() || 'A'}
                </DText>
              </View>
              <View style={styles.authorInfo}>
                <DText fontStyle="fontSemiBold" style={styles.authorText}>
                  {blog.author_name}
                </DText>
                <DText style={styles.authorRole}>Author</DText>
              </View>
            </View>
          </View>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <DText fontStyle="fontSemiBold" style={styles.tagsLabel}>
                Topics
              </DText>
              <View style={styles.tagsContainer}>
                {blog.tags.map((tag, index) => (
                  <View key={index} style={styles.tagChip}>
                    <DText style={styles.tagText}>{tag}</DText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Article Content with HTML Rendering */}
          <View style={styles.articleContent}>
            <DText fontStyle="fontSemiBold" style={styles.contentLabel}>
              Article
            </DText>
            <RenderHtml
              contentWidth={width - 40} // Account for container padding
              source={{html: htmlContent}}
              tagsStyles={htmlConfig.tagsStyles}
              defaultTextProps={htmlConfig.defaultTextProps}
            />
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <Header
        backgroundColor={'#FFF'}
        containerStyle={styles.headerContainer}
        leftComponent={
          <TouchableOpacity
            onPress={() => navigateBack()}
            style={styles.iconContainer}>
            <Image source={images.back} tintColor="#000" />
          </TouchableOpacity>
        }
        centerComponent={
          <View style={styles.nameContainer}>
            <DText
              fontStyle="fontBold"
              style={styles.headerTitle}
              textProps={{numberOfLines: 1}}>
              {blog?.title || 'News Detail'}
            </DText>
          </View>
        }
      />
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
  },
  nameContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#1A1A1A',
  },
  imageContainer: {
    position: 'relative',
    height: 250,
    backgroundColor: '#E5E5E5',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 0,
    paddingHorizontal: 20,
    paddingTop: 24,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  accentBar: {
    height: 2,
    backgroundColor: THEME_COLOR,
    marginHorizontal: -20,
    marginTop: -24,
    marginBottom: 24,
    opacity: 0.5,
  },
  metaContainer: {
    marginBottom: 24,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorInitial: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  authorInfo: {
    flex: 1,
  },
  authorText: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  authorRole: {
    fontSize: 14,
    color: '#666666',
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: '#E6F7F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME_COLOR,
  },
  tagText: {
    fontSize: 13,
    color: THEME_COLOR,
    fontWeight: '500' as const,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginBottom: 24,
  },
  articleContent: {
    marginBottom: 24,
  },
  contentLabel: {
    fontSize: 18,
    color: '#1A1A1A',
    marginBottom: 16,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    textAlign: 'justify',
  },
  bottomSpacing: {
    height: 40,
  },
  // Loading states
  loadingImageContainer: {
    height: 250,
    backgroundColor: '#E5E5E5',
  },
  loadingImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D1D5DB',
  },
  loadingTitle: {
    height: 30,
    backgroundColor: '#D1D5DB',
    borderRadius: 4,
    marginBottom: 16,
  },
  loadingAuthor: {
    height: 20,
    width: '40%',
    backgroundColor: '#D1D5DB',
    borderRadius: 4,
    marginBottom: 20,
  },
  loadingTagsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  loadingTag: {
    height: 28,
    width: 60,
    backgroundColor: '#D1D5DB',
    borderRadius: 14,
  },
  loadingContentLine: {
    height: 16,
    backgroundColor: '#D1D5DB',
    borderRadius: 4,
    marginBottom: 8,
  },
  loadingContentLineShort: {
    width: '60%',
  },
  // Error states
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIconContainer: {
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorTitle: {
    fontSize: 20,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: THEME_COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
});

export default NewsDetail;
