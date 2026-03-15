import { StyleSheet, Text, TextInput, View } from 'react-native';
import colors from '../theme/colors';

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSoft}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={[styles.input, multiline && styles.inputMultiline]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  inputWrap: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    color: colors.text,
    fontSize: 14,
    minHeight: 24,
  },
  inputMultiline: {
    minHeight: 100,
  },
});
