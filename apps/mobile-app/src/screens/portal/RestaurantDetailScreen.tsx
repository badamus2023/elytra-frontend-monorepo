import { useMemo } from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import styled from 'styled-components/native';
import { GradientButton } from '../../components/portal/GradientButton';
import {
  MutedText,
  PortalCard,
  PortalScreen,
} from '../../components/portal';
import { useCart } from '../../cart/CartContext';
import {
  useCategoriesByRestaurant,
  useProductsByRestaurant,
  useRestaurant,
} from '../../hooks/useRestaurants';
import type { RestaurantsStackParamList } from '../../navigation/types';

type Route = RouteProp<RestaurantsStackParamList, 'RestaurantDetail'>;
type Nav = NativeStackNavigationProp<RestaurantsStackParamList, 'RestaurantDetail'>;

const ProductRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-vertical: 12px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.divider};
`;

const ProductMain = styled.View`
  flex: 1;
`;

const ProductName = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const ProductDescription = styled.Text`
  margin-top: 2px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const ProductPrice = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const CategoryTitle = styled.Text`
  margin-top: 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const CartBar = styled.View`
  margin-top: 16px;
  padding: 12px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  background-color: ${({ theme }) => theme.colors.indigo};
`;

const CartBarText = styled.Text`
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
`;

const RestaurantDetailScreen = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { restaurantId } = route.params;
  const cart = useCart();

  const restaurantQuery = useRestaurant(restaurantId);
  const categoriesQuery = useCategoriesByRestaurant(restaurantId);
  const productsQuery = useProductsByRestaurant(restaurantId);

  const restaurant = restaurantQuery.data;
  const categories = categoriesQuery.data ?? [];
  const products = useMemo(
    () => (productsQuery.data ?? []).filter((product) => product.isAvailable !== false),
    [productsQuery.data],
  );

  const productsByCategory = categories.map((category) => ({
    category,
    items: products.filter((product) => product.categoryId === category.id),
  }));

  const uncategorized = products.filter(
    (product) => !categories.some((category) => category.id === product.categoryId),
  );

  const onAdd = (productId: string, name: string, price: number) => {
    cart.setRestaurant(restaurantId, restaurant?.name ?? 'Restaurant');
    cart.addItem({ productId, name, price });
  };

  if (restaurantQuery.isLoading) {
    return (
      <PortalScreen>
        <MutedText>Loading restaurant…</MutedText>
      </PortalScreen>
    );
  }

  if (!restaurant) {
    return (
      <PortalScreen>
        <PortalCard title="Restaurant not found">
          <GradientButton title="Back to list" onPress={() => navigation.goBack()} />
        </PortalCard>
      </PortalScreen>
    );
  }

  return (
    <PortalScreen>
      <PortalCard
        title={restaurant.name ?? 'Restaurant'}
        description={restaurant.description ?? undefined}
      >
        <MutedText>
          {restaurant.address ?? 'No address'} ·{' '}
          {restaurant.isOpen === false ? 'Closed' : 'Open for orders'}
        </MutedText>
      </PortalCard>

      <PortalCard title="Menu" description="Tap + to add items to your cart.">
        {productsQuery.isLoading ? (
          <MutedText>Loading menu…</MutedText>
        ) : products.length === 0 ? (
          <MutedText>No products listed yet.</MutedText>
        ) : (
          <>
            {productsByCategory.map(({ category, items }) =>
              items.length > 0 ? (
                <View key={String(category.id ?? category.name)}>
                  <CategoryTitle>{category.name ?? 'Category'}</CategoryTitle>
                  {items.map((product) =>
                    product.id ? (
                      <ProductRow key={product.id}>
                        <ProductMain>
                          <ProductName>{product.name ?? 'Unnamed product'}</ProductName>
                          {product.description ? (
                            <ProductDescription>{product.description}</ProductDescription>
                          ) : null}
                        </ProductMain>
                        <ProductPrice>
                          {Number(product.price ?? 0).toFixed(2)}
                        </ProductPrice>
                        <GradientButton
                          title="+"
                          onPress={() =>
                            onAdd(
                              product.id!,
                              product.name ?? 'Item',
                              Number(product.price ?? 0),
                            )
                          }
                        />
                      </ProductRow>
                    ) : null,
                  )}
                </View>
              ) : null,
            )}
            {uncategorized.length > 0 ? (
              <View>
                <CategoryTitle>Other items</CategoryTitle>
                {uncategorized.map((product) =>
                  product.id ? (
                    <ProductRow key={product.id}>
                      <ProductMain>
                        <ProductName>{product.name ?? 'Unnamed product'}</ProductName>
                      </ProductMain>
                      <ProductPrice>{Number(product.price ?? 0).toFixed(2)}</ProductPrice>
                      <GradientButton
                        title="+"
                        onPress={() =>
                          onAdd(
                            product.id!,
                            product.name ?? 'Item',
                            Number(product.price ?? 0),
                          )
                        }
                      />
                    </ProductRow>
                  ) : null,
                )}
              </View>
            ) : null}
          </>
        )}
      </PortalCard>

      {cart.restaurantId === restaurantId && cart.itemCount > 0 ? (
        <CartBar>
          <CartBarText>
            {cart.itemCount} item(s) · {cart.subtotal.toFixed(2)}
          </CartBarText>
          <GradientButton
            title="Review order"
            onPress={() => navigation.navigate('Checkout', { restaurantId })}
          />
        </CartBar>
      ) : null}
    </PortalScreen>
  );
};

export default RestaurantDetailScreen;
