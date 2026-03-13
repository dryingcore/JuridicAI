import { StatusBar } from 'expo-status-bar';
import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowUp, Scale, Plus, Mic, Headphones } from 'lucide-react-native';
import { Message } from './src/types';
import { analyzeLegalSituation } from './src/services/api';

function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: userText };
    
    setMessages((prev) => [...prev, newUserMsg]);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const result = await analyzeLegalSituation(userText);
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: '', 
        aiData: result 
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message || 'Ocorreu um erro ao consultar a IA.',
        isError: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';

    if (isUser) {
      return (
        <View style={styles.userMessageContainer}>
          <Text style={styles.userMessageText}>{item.content}</Text>
        </View>
      );
    }

    if (item.isError) {
      return (
         <View style={styles.aiMessageContainer}>
          <Text style={styles.errorMessageText}>{item.content}</Text>
        </View>
      );
    }

    if (item.aiData) {
      const { resumo, analise, artigos, vara, acao_recomendada, ratio_decidendi } = item.aiData;
      return (
        <View style={styles.aiMessageContainer}>
          <View style={styles.aiAvatar}>
            <Scale color="#FFF" size={16} />
          </View>
          <View style={styles.aiContentContainer}>
            <Text style={styles.aiTextBold}>Resumo</Text>
            <Text style={styles.aiText}>{resumo}</Text>
            
            <Text style={[styles.aiTextBold, { marginTop: 12 }]}>Análise Jurídica</Text>
            <Text style={styles.aiText}>{analise}</Text>

            <Text style={[styles.aiTextBold, { marginTop: 12 }]}>Fundamentação Legal</Text>
            {artigos.map((art, idx) => (
              <Text key={idx} style={styles.aiText}>• {art}</Text>
            ))}

            <View style={styles.highlightCard}>
              <Text style={styles.cardTitle}>DIRECIONAMENTO JURÍDICO</Text>
              
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Tribunal/Vara:</Text>
                <Text style={styles.cardValue}>{vara}</Text>
              </View>

              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Ação Recomendada:</Text>
                <View style={[styles.badge, acao_recomendada ? styles.badgeSuccess : styles.badgeDanger]}>
                  <Text style={styles.badgeText}>{acao_recomendada ? 'SIM' : 'NÃO'}</Text>
                </View>
              </View>

              <View style={styles.cardRowColumn}>
                <Text style={styles.cardLabel}>Ratio Decidendi:</Text>
                <Text style={styles.cardValueBlock}>{ratio_decidendi}</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>JuridicAI</Text>
        </View>

        {messages.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Scale color="#444" size={48} strokeWidth={1} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyStateTitle}>Tudo pronto?</Text>
            <Text style={styles.emptyStateSubtitle}>Descreva a situação fática abaixo{"\n"}para avaliação jurídica iterativa.</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={
              isLoading ? (
                <View style={styles.loadingContainer}>
                   <View style={styles.aiAvatar}>
                      <Scale color="#FFF" size={16} />
                   </View>
                   <ActivityIndicator size="small" color="#FFF" />
                </View>
              ) : null
            }
          />
        )}

        <View style={styles.inputOuterContainer}>
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.plusButton}>
              <Plus color="#8E8E8E" size={24} />
            </TouchableOpacity>
            
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Pergunte alguma coisa"
              placeholderTextColor="#8E8E8E"
              multiline
              maxLength={1000}
            />
            
            {inputText.trim().length === 0 ? (
              <View style={styles.rightIconsContainer}>
                <TouchableOpacity style={styles.iconButton}>
                  <Mic color="#8E8E8E" size={20} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButtonWhite}>
                  <Headphones color="#000" size={16} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={[styles.sendButton, styles.sendButtonActive]} 
                onPress={sendMessage}
                disabled={isLoading}
              >
                <ArrowUp color="#000" size={20} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ChatScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121', // Dark background inspired by ChatGPT Mobile
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2F2F2F',
  },
  headerTitle: {
    color: '#ECECEC',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    color: '#ECECEC',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    color: '#8E8E8E',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  messageList: {
    padding: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#2F2F2F', // User message bubble color
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderBottomRightRadius: 4, // Chat bubble tail effect
    maxWidth: '85%',
    marginBottom: 24,
  },
  userMessageText: {
    color: '#ECECEC',
    fontSize: 16,
    lineHeight: 22,
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    maxWidth: '90%',
    marginBottom: 32,
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#10A37F', // ChatGPT inspired accent color but we use an icon
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  aiContentContainer: {
    flex: 1,
  },
  aiText: {
    color: '#ECECEC',
    fontSize: 16,
    lineHeight: 24,
  },
  aiTextBold: {
    color: '#ECECEC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  errorMessageText: {
    color: '#FF453A',
    fontSize: 16,
    lineHeight: 24,
  },
  highlightCard: {
    marginTop: 20,
    backgroundColor: '#1C1C1E', // Very dark card background
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  cardTitle: {
    color: '#8E8E8E',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardRowColumn: {
    flexDirection: 'column',
    marginTop: 8,
  },
  cardLabel: {
    color: '#A0A0A5',
    fontSize: 14,
    fontWeight: '600',
  },
  cardValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  cardValueBlock: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(48, 209, 88, 0.2)',
  },
  badgeDanger: {
    backgroundColor: 'rgba(255, 69, 58, 0.2)',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inputOuterContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8, // Added little bottom padding when keyboard is active
    backgroundColor: '#212121',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#2F2F2F', // Same pill background color
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 50,
  },
  textInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    maxHeight: 120,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 8,
    paddingRight: 8,
  },
  plusButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
    marginBottom: 2,
    marginRight: 4,
  },
  rightIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
    marginHorizontal: 4,
  },
  iconButtonWhite: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    marginLeft: 4,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#FFF', // White button when active
  },
  sendButtonInactive: {
    backgroundColor: '#3A3A3C', // Dim gray when inactive
  }
});
