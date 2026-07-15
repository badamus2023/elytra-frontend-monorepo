import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import styled from 'styled-components/native';
import {
  EmptyText,
  MutedText,
  PortalCard,
  PortalScreen,
  PortalSearchInput,
  TextLink,
} from '../../components/portal';
import { useRestaurants } from '../../hooks/useRestaurants';
import type { RestaurantsStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RestaurantsStackParamList, 'RestaurantsList'>;

const Card = styled.Pressable`
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const Title = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Meta = styled.Text`
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Description = styled.Text`
  margin-top: 8px;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.textSubtle};
`;

const RestaurantsListScreen = () => {
  const navigation = useNavigation<Nav>();
  const restaurantsQuery = useRestaurants();
  const [search, setSearch] = useState('');

  const restaurants = useMemo(() => {
    const list = restaurantsQuery.data ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (restaurant) =>
        (restaurant.name ?? '').toLowerCase().includes(term) ||
        (restaurant.description ?? '').toLowerCase().includes(term) ||
        (restaurant.address ?? '').toLowerCase().includes(term),
    );
  }, [restaurantsQuery.data, search]);

  return (
    <PortalScreen>
      <PortalCard
        title="Restaurants"
        description="Browse partner kitchens and order for drone delivery."
      >
        <PortalSearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search restaurants..."
        />
        {restaurantsQuery.isLoading ? (
          <MutedText>Loading restaurants…</MutedText>
        ) : restaurants.length === 0 ? (
          <EmptyText>
            {search.trim()
              ? 'No restaurants match your search.'
              : 'No restaurants are available yet.'}
          </EmptyText>
        ) : (
          restaurants.map((restaurant) => (
            <Card
              key={restaurant.id}
              onPress={() =>
                restaurant.id
                  ? navigation.navigate('RestaurantDetail', {
                      restaurantId: restaurant.id,
                    })
                  : undefined
              }
            >
              <Title>{restaurant.name ?? 'Unnamed restaurant'}</Title>
              <Meta>
                {restaurant.isOpen === false ? 'Closed' : 'Open now'}
                {restaurant.averageRating != null
                  ? ` · ${restaurant.averageRating.toFixed(1)} ★`
                  : ''}
              </Meta>
              <Description>
                {restaurant.description ?? restaurant.address ?? 'No description yet.'}
              </Description>
              {restaurant.id ? (
                <TextLink
                  title="View menu →"
                  onPress={() =>
                    navigation.navigate('RestaurantDetail', {
                      restaurantId: restaurant.id!,
                    })
                  }
                />
              ) : null}
            </Card>
          ))
        )}
      </PortalCard>
    </PortalScreen>
  );
};

export default RestaurantsListScreen;
