import React, { useState } from 'react';
import Background from '../../components/atoms/Background';
import BackButton from '../../components/atoms/BackButton';
import Logo from '../../components/atoms/Logo';
import Header from '../../components/atoms/Header';
import TextInput from '../../components/atoms/TextInput';
import Button from '../../components/atoms/Button';
import { emailValidator } from '../../helpers/emailValidator';
import { Toolbar } from '../../components/atoms/Toolbar';

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
        source={require('../../assets/images/ESCUDO_LOGO_DSG_2020_FONDO_BLANCO.png')}
        size={110}
        style={{ marginBottom: 16, borderWidth: 2 }}
      />
      <Header>Restore Password</Header>
      <TextInput
        label="E-mail address"
        returnKeyType="done"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        description="You will receive email with password reset link."
      />
      <Button
        mode="contained"
        onPress={sendResetPasswordEmail}
        style={{ marginTop: 16 }}
      >
        Send Instructions
      </Button>
    </Background>
  );
}
