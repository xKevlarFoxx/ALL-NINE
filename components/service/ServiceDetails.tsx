// components/service/ServiceDetails.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../ThemeProvider';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface ServiceDetailsProps {
 description: string;
 categories: string[];
 features: string[];
 pricing: {
   basePrice: number;
   currency: string;
   unit: string;
 };
 availability: {
   days: string[];
   hours: string;
 };
 style?: StyleProp<ViewStyle>;
}

export const ServiceDetails: React.FC<ServiceDetailsProps> = ({
 description,
 categories,
 features,
 pricing,
 availability,
 style
}) => {
 const theme = useTheme();

 return (
   <ScrollView style={[styles.container, style]}>
     <Card style={styles.section}>
       <Text style={[theme.typography.h4, styles.sectionTitle]}>
         About
       </Text>
       <Text style={[theme.typography.body2, styles.description]}>
         {description}
       </Text>
     </Card>

     <Card style={styles.section}>
       <Text style={[theme.typography.h4, styles.sectionTitle]}>
         Categories
       </Text>
       <View style={styles.categories}>
         {categories.map((category, index) => (
           <Badge
             key={index}
             label={category}
             variant="info"
             outline
             style={styles.badge}
           />
         ))}
       </View>
     </Card>

     <Card style={styles.section}>
       <Text style={[theme.typography.h4, styles.sectionTitle]}>
         Features
       </Text>
       <View style={styles.features}>
         {features.map((feature, index) => (
           <View key={index} style={styles.featureItem}>
             <View style={[
               styles.bullet,
               { backgroundColor: theme.colors.primary.main }
             ]} />
             <Text style={theme.typography.body2}>{feature}</Text>
           </View>
         ))}
       </View>
     </Card>

     <Card style={styles.section}>
       <Text style={[theme.typography.h4, styles.sectionTitle]}>
         Pricing
       </Text>
       <View style={styles.pricing}>
         <Text style={[theme.typography.h3, styles.price]}>
           {pricing.currency}{pricing.basePrice}
         </Text>
         <Text style={[theme.typography.body2, styles.priceUnit]}>
           per {pricing.unit}
         </Text>
       </View>
     </Card>

     <Card style={styles.section}>
       <Text style={[theme.typography.h4, styles.sectionTitle]}>
         Availability
       </Text>
       <Text style={theme.typography.body2}>
         {availability.days.join(', ')}
       </Text>
       <Text style={[theme.typography.body2, styles.hours]}>
         {availability.hours}
       </Text>
     </Card>
   </ScrollView>
 );
};

const styles = StyleSheet.create({
 container: {
   flex: 1,
 },
 section: {
   marginHorizontal: 16,
   marginVertical: 8,
 },
 sectionTitle: {
   marginBottom: 12,
 },
 description: {
   lineHeight: 24,
 },
 categories: {
   flexDirection: 'row',
   flexWrap: 'wrap',
 },
 badge: {
   marginRight: 8,
   marginBottom: 8,
 },
 features: {
   marginTop: 8,
 },
 featureItem: {
   flexDirection: 'row',
   alignItems: 'center',
   marginBottom: 8,
 },
 bullet: {
   width: 6,
   height: 6,
   borderRadius: 3,
   marginRight: 8,
 },
 pricing: {
   flexDirection: 'row',
   alignItems: 'baseline',
 },
 price: {
   marginRight: 4,
 },
 priceUnit: {
   color: '#666',
 },
 hours: {
   marginTop: 4,
   color: '#666',
 },
});