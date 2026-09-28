import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useTheme } from '@/hooks/use-theme';
import { getCourseById, MOCK_COURSES } from '@/data/mockDatabase';

export default function CheckoutScreen() {
  const { colors, typography, spacing, radii, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();

  const course = getCourseById(courseId || '1') || MOCK_COURSES[0];

  const [paymentMethod, setPaymentMethod] = useState('applepay');
  const [isSaved, setIsSaved] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoCode, setPromoCode] = useState('EDUFLOW2026');

  const discount = course.originalPrice ? course.originalPrice - course.price : 0;
  const promoDiscount = promoApplied ? 15 : 0;
  const finalPrice = course.price - promoDiscount;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.headerBg, borderBottomColor: colors.headerBorder }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.primaryContainer} />
          </TouchableOpacity>
          <Text style={[typography.headlineSm, { color: colors.textPrimary }]} numberOfLines={1}>
            Checkout
          </Text>
          <View style={styles.iconBtn} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 60,
          paddingBottom: insets.bottom + 100, // Space for bottom dock
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="chevron-back" size={20} color={colors.primary} style={{ marginLeft: -4 }} />
            <Text style={[typography.bodyMd, { color: colors.primary }]}>Cart</Text>
          </TouchableOpacity>
          <View style={[styles.encryptBadge, { backgroundColor: colors.surface2 }]}>
            <Ionicons name="lock-closed" size={14} color={colors.success} />
            <Text style={[typography.labelSm, { color: colors.onSurfaceVariant, marginLeft: 4 }]}>Secure Checkout</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.md, gap: spacing.md }}>
          {/* Order Item */}
          {!isRemoved && (
            <View style={[styles.orderCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[styles.orderImgBox, { backgroundColor: colors.surface2, borderRadius: radii.lg }]}>
                <Image source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-oiV3gEvg_3ngqB2ZgQRbH285dl50Jj2Fs2P2vUWFJGRQoU0k0PNzy9fvkLLnbmE2lVomVYhP48auXeUNuydmLwNQZTnW01miNMP_w4BykIc-t8Y23budPy3N8ll1xsaCN8-YqcmkXuVgVQi8oAfDOZARxAyIV5SdAQSLyP0neVvLsiMGYLICYcSFGufPsYppQZABSlIf8j1XJOIGL_0xNGpZJvbR1dvuNn0r_RT9otGQpsuUKX00' }} style={styles.orderImg} />
                <View style={[styles.tokenIcon, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
                  <Ionicons name="cube" size={12} color={colors.primary} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4 }}>
                  <View style={[styles.miniTag, { backgroundColor: 'rgba(68, 65, 204, 0.1)' }]}><Text style={[typography.labelSm, { color: colors.primary }]}>Lifetime Access</Text></View>
                  <View style={[styles.miniTag, { backgroundColor: 'rgba(50, 183, 107, 0.1)' }]}><Text style={[typography.labelSm, { color: colors.success }]}>iOS 18</Text></View>
                </View>
                <Text style={[typography.headlineSm, { color: colors.textPrimary }]} numberOfLines={1}>{course.title}</Text>
                <Text style={[typography.bodySm, { color: colors.textSecondary }]}>{course.instructor.name} • {course.instructor.role}</Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
                  <Text style={[typography.headlineMd, { color: colors.primary }]}>${course.price.toFixed(2)}</Text>
                  {course.originalPrice > 0 && (
                    <Text style={[typography.bodySm, { color: colors.textTertiary, textDecorationLine: 'line-through' }]}>${course.originalPrice.toFixed(2)}</Text>
                  )}
                  {discount > 0 && (
                    <View style={[styles.discountTag, { backgroundColor: 'rgba(255, 149, 0, 0.1)' }]}>
                      <Text style={[typography.labelSm, { color: colors.warning, fontWeight: '600' }]}>{Math.round((discount / course.originalPrice) * 100)}% OFF</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <View style={[styles.orderActions, { backgroundColor: colors.surface1 }]}>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} onPress={() => setIsSaved(!isSaved)}>
                <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={16} color={isSaved ? colors.primary : colors.textSecondary} />
                <Text style={[typography.labelMd, { color: isSaved ? colors.primary : colors.textSecondary }]}>{isSaved ? 'Saved' : 'Save for later'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} onPress={() => setIsRemoved(true)}>
                <Ionicons name="trash-outline" size={16} color={colors.error} />
                <Text style={[typography.labelMd, { color: colors.error }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
          )}

          {/* Coupon */}
          <View style={[styles.couponCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
            <Text style={[typography.labelMd, { color: colors.onSurfaceVariant, marginBottom: 8 }]}>Have a promotional voucher?</Text>
            
            {!promoApplied ? (
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <View style={[styles.couponInputBox, { backgroundColor: colors.surface1, borderRadius: radii.lg }]}>
                  <Ionicons name="ticket-outline" size={18} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.couponInput, typography.bodyMd, { color: colors.textPrimary, fontWeight: '600' }]}
                    value={promoCode}
                    onChangeText={setPromoCode}
                    autoCapitalize="characters"
                  />
                </View>
                <TouchableOpacity 
                  style={[styles.applyBtn, { backgroundColor: colors.primaryContainer, borderRadius: radii.lg }]} 
                  onPress={() => setPromoApplied(true)}
                >
                  <Text style={[typography.labelLg, { color: colors.onPrimary }]}>Apply</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.successBanner, { backgroundColor: 'rgba(50, 183, 107, 0.1)' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={[typography.labelMd, { color: colors.success, fontWeight: '500' }]}>DISCOUNT -$15.00 applied</Text>
                </View>
                <TouchableOpacity onPress={() => setPromoApplied(false)}>
                  <Ionicons name="close" size={16} color={colors.success} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Payment Method */}
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 }}>
              <Text style={[typography.labelLg, { color: colors.textPrimary }]}>Payment Method</Text>
              <Text style={[typography.labelSm, { color: colors.textSecondary }]}>Instant Activation</Text>
            </View>
            
            <View style={[styles.paymentGroup, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
              <TouchableOpacity style={[styles.paymentRow, paymentMethod === 'applepay' && { backgroundColor: 'rgba(226, 223, 255, 0.3)' }]} onPress={() => setPaymentMethod('applepay')}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[styles.payIconBox, { backgroundColor: colors.textPrimary }]}>
                    <Ionicons name="logo-apple" size={20} color={colors.surface0} />
                  </View>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>Apple Pay</Text>
                      <View style={[styles.defaultTag, { backgroundColor: colors.textPrimary }]}><Text style={{ color: colors.surface0, fontSize: 10, fontWeight: '600' }}>DEFAULT</Text></View>
                    </View>
                    <Text style={[typography.bodySm, { color: colors.textSecondary }]}>Quick and secure with Face ID</Text>
                  </View>
                </View>
                <View style={[styles.radio, paymentMethod === 'applepay' ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface2 }]}>
                  {paymentMethod === 'applepay' && <Ionicons name="checkmark" size={16} color={colors.surface0} />}
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.paymentRow, paymentMethod === 'card' && { backgroundColor: 'rgba(226, 223, 255, 0.3)' }]} onPress={() => setPaymentMethod('card')}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[styles.payIconBox, { backgroundColor: colors.surface2 }]}>
                    <Ionicons name="card-outline" size={22} color={colors.textSecondary} />
                  </View>
                  <View>
                    <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>Credit or Debit Card</Text>
                    <Text style={[typography.bodySm, { color: colors.textSecondary }]}>Visa • Mastercard ending in 4242</Text>
                  </View>
                </View>
                <View style={[styles.radio, paymentMethod === 'card' ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface2 }]}>
                  {paymentMethod === 'card' && <Ionicons name="checkmark" size={16} color={colors.surface0} />}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Order Summary */}
          <View style={[styles.summaryCard, { backgroundColor: colors.surface0, borderRadius: radii.xl }, shadows.sm]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={[typography.labelLg, { color: colors.textPrimary }]}>Order Summary</Text>
              <Text style={[typography.labelSm, { color: colors.textSecondary }]}>1 Item</Text>
            </View>
            <View style={{ gap: 6, marginBottom: 12 }}>
              <View style={styles.sumRow}><Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>Original Price</Text><Text style={[typography.bodySm, { color: colors.textPrimary, fontWeight: '500' }]}>${(course.originalPrice || course.price).toFixed(2)}</Text></View>
              {discount > 0 && (
                <View style={styles.sumRow}><Text style={[typography.bodySm, { color: colors.success }]}>Course Discount</Text><Text style={[typography.bodySm, { color: colors.success, fontWeight: '500' }]}>-${discount.toFixed(2)}</Text></View>
              )}
              {promoApplied && (
                <View style={styles.sumRow}><Text style={[typography.bodySm, { color: colors.success }]}>Voucher Promo</Text><Text style={[typography.bodySm, { color: colors.success, fontWeight: '500' }]}>-$15.00</Text></View>
              )}
            </View>
            <View style={[styles.sumTotalBox, { backgroundColor: colors.surface1 }]}>
              <Text style={[typography.headlineSm, { color: colors.textPrimary }]}>Total Amount</Text>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[typography.headlineLg, { color: colors.primary }]}>${Math.max(0, finalPrice).toFixed(2)}</Text>
                {discount + promoDiscount > 0 && (
                  <Text style={[typography.labelSm, { color: colors.success, fontWeight: '500' }]}>You save ${(discount + promoDiscount).toFixed(2)} ({Math.round(((discount + promoDiscount) / (course.originalPrice || course.price)) * 100)}%)</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Dock */}
      <View style={[styles.bottomDock, { backgroundColor: colors.dockBg, paddingBottom: insets.bottom + 12 }, shadows.md]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.labelSm, { color: colors.textSecondary, textTransform: 'uppercase' }]}>Total Due</Text>
            <Text style={[typography.headlineLg, { color: colors.textPrimary, marginTop: 2 }]}>${Math.max(0, finalPrice).toFixed(2)}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.payCta, { backgroundColor: paymentMethod === 'applepay' ? colors.textPrimary : colors.primary }, shadows.sm]}
            onPress={() => router.push({ pathname: '/payment-success', params: { courseId: course.id, finalPrice: Math.max(0, finalPrice) } })}
          >
            {paymentMethod === 'applepay' ? (
              <>
                <Ionicons name="logo-apple" size={20} color={colors.surface0} />
                <Text style={[typography.labelLg, { color: colors.surface0, fontWeight: '500' }]}>Pay with Apple Pay</Text>
              </>
            ) : (
              <>
                <Ionicons name="lock-closed" size={18} color={colors.onPrimary} />
                <Text style={[typography.labelLg, { color: colors.onPrimary, fontWeight: '600' }]}>Complete Purchase</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: StyleSheet.hairlineWidth, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 56 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  encryptBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  orderCard: { overflow: 'hidden' },
  orderImgBox: { width: 80, height: 80, margin: 16, marginRight: 0 },
  orderImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 8 },
  tokenIcon: { position: 'absolute', bottom: 4, right: 4, padding: 2, borderRadius: 4 },
  miniTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  discountTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 'auto' },
  orderActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, marginTop: 12 },
  couponCard: { padding: 14 },
  couponInputBox: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: 12, height: 44 },
  couponInput: { flex: 1, height: '100%', marginLeft: 8 },
  applyBtn: { paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' },
  successBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  paymentGroup: { overflow: 'hidden' },
  paymentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  payIconBox: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  defaultTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  radio: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  summaryCard: { padding: 16 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sumTotalBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginHorizontal: -16, marginBottom: -16, padding: 16, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, marginTop: 8 },
  bottomDock: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  payCta: { flex: 1.5, flexDirection: 'row', height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
});

