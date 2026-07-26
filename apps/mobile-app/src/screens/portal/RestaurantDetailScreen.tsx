import { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import styled, { useTheme } from 'styled-components/native';
import { GradientButton } from '../../components/portal/GradientButton';
import {
  MutedText,
  PortalCard,
  PortalScreen,
} from '../../components/portal';
import { useCart } from '../../cart/CartContext';
import { useAuth } from '../../auth/AuthContext';
import {
  useDeleteApiReviewsReviewId,
  useGetApiReviewsRestaurantRestaurantId,
  usePostApiReviews,
} from '../../api/generated/review/review';
import {
  useCategoriesByRestaurant,
  useProductsByRestaurant,
  useRestaurant,
} from '../../hooks/useRestaurants';
import type { RestaurantsStackParamList } from '../../navigation/types';
import { getErrorMessage } from '../../utils/getErrorMessage';

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
  min-width: 0;
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
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const QuantityControl = styled.View`
  min-height: 44px;
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.orangeBorder};
  border-radius: ${({ theme }) => theme.radius.pill}px;
  background-color: ${({ theme }) => theme.colors.warningBg};
`;

const QuantityButton = styled.Pressable`
  width: 40px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
`;

const QuantityText = styled.Text`
  min-width: 24px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.warningText};
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
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.orangeBorder};
  border-radius: ${({ theme }) => theme.radius.xl}px;
  background-color: ${({ theme }) => theme.colors.white};
  shadow-color: #0f172a;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.12;
  shadow-radius: 8px;
  elevation: 4;
`;

const CartSummary = styled.View`
  min-width: 150px;
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const CartBarText = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ReviewItem = styled.View`
  margin-bottom: 8px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.portalBg};
  padding: ${({ theme }) => theme.spacing.md}px;
`;

const ReviewHeader = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const ReviewAuthor = styled.Text`
  flex: 1;
  min-width: 120px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const ReviewRating = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.warningText};
`;

const ReviewComment = styled.Text`
  margin-top: 6px;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.textSubtle};
`;

const RatingLabel = styled.Text`
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const RatingRow = styled.View`
  flex-direction: row;
  gap: 4px;
  margin-bottom: 12px;
`;

const RatingButton = styled.Pressable`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
`;

const RatingStar = styled.Text<{ $selected: boolean }>`
  font-size: 28px;
  color: ${({ $selected, theme }) =>
    $selected ? theme.colors.amber : theme.colors.inputBorder};
`;

const ReviewInput = styled.TextInput.attrs(({ theme }) => ({
  placeholderTextColor: theme.colors.placeholder,
}))`
  min-height: 96px;
  margin-bottom: 12px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const ReviewError = styled.Text`
  margin-bottom: 12px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.errorText};
`;

const ReviewAction = styled.View`
  margin-top: ${({ theme }) => theme.spacing.md}px;
  align-items: flex-end;
`;

type ProductCartControlProps = {
  name: string;
  quantity: number;
  onAdd: () => void;
  onUpdateQuantity: (quantity: number) => void;
};

const ProductCartControl = ({
  name,
  quantity,
  onAdd,
  onUpdateQuantity,
}: ProductCartControlProps) => {
  const theme = useTheme();

  if (quantity === 0) {
    return (
      <GradientButton
        title="Add item"
        accessibilityLabel={`Add ${name} to cart`}
        icon={<Plus color={theme.colors.white} size={18} />}
        variant="checkout"
        size="icon"
        fullWidth={false}
        onPress={onAdd}
      />
    );
  }

  return (
    <QuantityControl>
      <QuantityButton
        accessibilityRole="button"
        accessibilityLabel={
          quantity === 1 ? `Remove ${name} from cart` : `Remove one ${name}`
        }
        onPress={() => onUpdateQuantity(quantity - 1)}
      >
        {quantity === 1 ? (
          <Trash2 color={theme.colors.warningText} size={16} />
        ) : (
          <Minus color={theme.colors.warningText} size={16} />
        )}
      </QuantityButton>
      <QuantityText>{quantity}</QuantityText>
      <QuantityButton
        accessibilityRole="button"
        accessibilityLabel={`Add one ${name}`}
        onPress={() => onUpdateQuantity(quantity + 1)}
      >
        <Plus color={theme.colors.warningText} size={16} />
      </QuantityButton>
    </QuantityControl>
  );
};

const RestaurantDetailScreen = () => {
  const theme = useTheme();
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { restaurantId } = route.params;
  const cart = useCart();
  const { user } = useAuth();

  const restaurantQuery = useRestaurant(restaurantId);
  const categoriesQuery = useCategoriesByRestaurant(restaurantId);
  const productsQuery = useProductsByRestaurant(restaurantId);
  const reviewsQuery = useGetApiReviewsRestaurantRestaurantId(restaurantId);
  const createReview = usePostApiReviews();
  const deleteReview = useDeleteApiReviewsReviewId();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);

  const restaurant = restaurantQuery.data;
  const categories = categoriesQuery.data ?? [];
  const reviews = reviewsQuery.data ?? [];
  const ownReview = reviews.find((review) => review.userId === user?.id);
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

  const onSubmitReview = async () => {
    setReviewError(null);
    try {
      await createReview.mutateAsync({
        data: {
          restaurantId,
          rating,
          comment: comment.trim() || null,
        },
      });
      setComment('');
      setRating(5);
      await Promise.all([reviewsQuery.refetch(), restaurantQuery.refetch()]);
    } catch (error) {
      setReviewError(getErrorMessage(error, 'Could not submit your review.'));
    }
  };

  const onDeleteReview = () => {
    if (!ownReview?.id) return;
    Alert.alert(
      'Delete review',
      'Delete your review for this restaurant?',
      [
        { text: 'Keep review', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setReviewError(null);
            try {
              await deleteReview.mutateAsync({ reviewId: ownReview.id! });
              await Promise.all([
                reviewsQuery.refetch(),
                restaurantQuery.refetch(),
              ]);
            } catch (error) {
              setReviewError(
                getErrorMessage(error, 'Could not delete your review.'),
              );
            }
          },
        },
      ],
    );
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
                        <ProductCartControl
                          name={product.name ?? 'item'}
                          quantity={
                            cart.lines.find(
                              (line) => line.productId === product.id,
                            )?.quantity ?? 0
                          }
                          onAdd={() =>
                            onAdd(
                              product.id!,
                              product.name ?? 'Item',
                              Number(product.price ?? 0),
                            )
                          }
                          onUpdateQuantity={(quantity) =>
                            cart.updateQuantity(product.id!, quantity)
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
                      <ProductCartControl
                        name={product.name ?? 'item'}
                        quantity={
                          cart.lines.find(
                            (line) => line.productId === product.id,
                          )?.quantity ?? 0
                        }
                        onAdd={() =>
                          onAdd(
                            product.id!,
                            product.name ?? 'Item',
                            Number(product.price ?? 0),
                          )
                        }
                        onUpdateQuantity={(quantity) =>
                          cart.updateQuantity(product.id!, quantity)
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
          <CartSummary>
            <ShoppingBag size={18} color={theme.colors.orange} />
            <CartBarText>
              {cart.itemCount} item(s) · {cart.subtotal.toFixed(2)} PLN
            </CartBarText>
          </CartSummary>
          <GradientButton
            title="Review order"
            variant="checkout"
            size="compact"
            fullWidth={false}
            onPress={() => navigation.navigate('Checkout', { restaurantId })}
          />
        </CartBar>
      ) : null}

      {!ownReview ? (
        <PortalCard title="Leave a review">
          <>
            <RatingLabel>Rating</RatingLabel>
            <RatingRow>
              {[1, 2, 3, 4, 5].map((value) => (
                <RatingButton
                  key={value}
                  accessibilityRole="button"
                  accessibilityLabel={`${value} star${value === 1 ? '' : 's'}`}
                  accessibilityState={{ selected: rating === value }}
                  onPress={() => setRating(value)}
                >
                  <RatingStar $selected={value <= rating}>★</RatingStar>
                </RatingButton>
              ))}
            </RatingRow>
            <RatingLabel>Comment (optional)</RatingLabel>
            <ReviewInput
              value={comment}
              onChangeText={setComment}
              placeholder="How was your order?"
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />
            {reviewError ? <ReviewError>{reviewError}</ReviewError> : null}
            <ReviewAction>
              <GradientButton
                title={createReview.isPending ? 'Submitting…' : 'Submit review'}
                size="compact"
                fullWidth={false}
                loading={createReview.isPending}
                disabled={createReview.isPending}
                onPress={onSubmitReview}
              />
            </ReviewAction>
          </>
        </PortalCard>
      ) : null}

      <PortalCard title="Customer reviews">
        {reviewsQuery.isLoading ? (
          <MutedText>Loading reviews…</MutedText>
        ) : reviews.length === 0 ? (
          <MutedText>No reviews yet. Be the first!</MutedText>
        ) : (
          reviews.map((review, index) => (
            <ReviewItem key={review.id ?? `review-${index}`}>
              <ReviewHeader>
                <ReviewAuthor>
                  {review.userId === user?.id
                    ? 'You (your review)'
                    : review.userEmail ?? 'Customer'}
                </ReviewAuthor>
                <ReviewRating>{review.rating ?? 0}/5 ★</ReviewRating>
              </ReviewHeader>
              <ReviewComment>{review.comment || 'No comment'}</ReviewComment>
              {review.userId === user?.id ? (
                <>
                  {reviewError ? <ReviewError>{reviewError}</ReviewError> : null}
                  <ReviewAction>
                    <GradientButton
                      title={
                        deleteReview.isPending ? 'Deleting…' : 'Delete review'
                      }
                      variant="danger"
                      size="compact"
                      fullWidth={false}
                      loading={deleteReview.isPending}
                      disabled={deleteReview.isPending}
                      onPress={onDeleteReview}
                    />
                  </ReviewAction>
                </>
              ) : null}
            </ReviewItem>
          ))
        )}
      </PortalCard>

    </PortalScreen>
  );
};

export default RestaurantDetailScreen;
