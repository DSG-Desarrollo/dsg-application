import React, { useState } from 'react';
import Background from '@components/atoms/Background';
import BackButton from '@components/atoms/BackButton';
import Button from '@components/atoms/Button';
import Header from '@components/atoms/Header';
import Logo from '@components/atoms/Logo';
import TextInput from '@components/atoms/TextInput';
import { emailValidator } from '@helpers/emailValidator';
import i18n from '@i18n/i18n';

export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState({ value: '', error: '' });

  const sendResetPasswordEmail = () => {
    const emailError = emailValidator(email.value);
    if (emailError) {
      setEmail({ ...email, error: emailError });
      return;
    }
    navigation.navigate('LoginScreen');
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo
        source={require('@assets/images/ESCUDO_LOGO_DSG_2020_FONDO_BLANCO.png')}
        size={110}
        style={{ marginBottom: 16 }}
      />
      <Header>{i18n.t('auth:resetPassword')}</Header>
      <TextInput
        label={i18n.t('auth:emailAddress')}
        returnKeyType="done"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        description={i18n.t('auth:resetPasswordDescription')}
      />
      <Button
        mode="contained"
        onPress={sendResetPasswordEmail}
        style={{ marginTop: 16 }}
      >
        {i18n.t('auth:sendResetInstructions')}
      </Button>
    </Background>
  );
}
