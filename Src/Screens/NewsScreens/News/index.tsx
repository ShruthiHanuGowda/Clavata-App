import React, {JSX} from 'react';
import {Header} from '@rneui/base';
import {
  View,
  RefreshControl,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import {DText} from '../../../Componants/DText';
import {navigateBack, navigateTo} from '../../../utils/navigationService';
import images from '../../../Theme/images';
import {useBlogs} from '../Hooks/NewsGraphql';
import {Blog} from '../Hooks/type';
import NewsCard from '../Componants/NewsCard';
import {styles} from './styles';

const THEME_COLOR = '#009D94';

const EmptyState: React.FC = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconContainer}>
      <DText style={styles.emptyIcon}>📰</DText>
    </View>
    <DText fontStyle="fontBold" style={styles.emptyTitle}>
      No News Available
    </DText>
    <DText style={styles.emptySubtitle}>
      Check back later for the latest updates
    </DText>
  </View>
);

const LoadingCard: React.FC = () => (
  <View style={styles.loadingCard}>
    <View style={styles.loadingImage} />
    <View style={styles.loadingContent}>
      <View style={styles.loadingTitle} />
      <View style={styles.loadingAuthor} />
      <View style={styles.loadingTags}>
        <View style={styles.loadingTag} />
        <View style={styles.loadingTag} />
      </View>
    </View>
  </View>
);

function News(): JSX.Element {
  const {loading, data, error, refetch} = useBlogs();

  const handleNewsPress = (blog: Blog) => {
    navigateTo('NewsDetail', {blogID: blog.id});
  };

  const renderNewsItem = ({item}: {item: Blog}) => (
    <NewsCard blog={item} onPress={handleNewsPress} />
  );

  const renderLoadingItems = () => (
    <View>
      {[1, 2, 3].map(item => (
        <LoadingCard key={item} />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
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
            <DText fontStyle="fontBold" style={styles.title}>
              News Articles
            </DText>
          </View>
        }
      />

      {error ? (
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <DText style={styles.errorIcon}>⚠️</DText>
          </View>
          <DText fontStyle="fontBold" style={styles.errorTitle}>
            Something went wrong
          </DText>
          <DText style={styles.errorSubtitle}>
            {error.message || 'Failed to load news'}
          </DText>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <DText style={styles.retryText}>Try Again</DText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderNewsItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              colors={[THEME_COLOR]}
              tintColor={THEME_COLOR}
            />
          }
          ListEmptyComponent={loading ? renderLoadingItems() : <EmptyState />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

export default News;
