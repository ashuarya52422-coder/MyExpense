import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function App() {
  const [balance, setBalance] = useState(5000);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [personOrNotes, setPersonOrNotes] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState('Expense');

  const emiDueDate = "10th of every month";
  const emiAmount = 1500;

  const handleAddTransaction = () => {
    if (!amount || isNaN(amount)) {
      Alert.alert('Error', 'Kripya sahi Amount daalein');
      return;
    }

    const numAmount = parseFloat(amount);
    let newBalance = balance;

    if (type === 'Expense') {
      newBalance -= numAmount;
    } else if (type === 'Income') {
      newBalance += numAmount;
    }

    if (newBalance < 2000 && type === 'Expense') {
      Alert.alert('⚠️ Warning: Low Balance Alert!', 'Aapka balance ₹2,000 se kam ho gaya hai.');
    }

    setBalance(newBalance);

    const newTx = {
      id: Date.now().toString(),
      amount: numAmount,
      type,
      category: type === 'Expense' ? category : 'General',
      personOrNotes: personOrNotes || 'N/A',
      date: new Date().toLocaleDateString(),
    };

    setTransactions([newTx, ...transactions]);
    setAmount('');
    setPersonOrNotes('');
  };

  // PDF Generation Code
  const exportCategoryPDF = async () => {
    if (transactions.length === 0) {
      Alert.alert('Notice', 'PDF banane ke liye kam se kam ek transaction hona chahiye.');
      return;
    }

    const categoryRows = transactions.map(tx => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${tx.date}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${tx.type}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${tx.category}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${tx.personOrNotes}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: ${tx.type === 'Income' ? 'green' : 'red'};">
          ₹${tx.amount}
        </td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { color: #1976d2; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #1976d2; color: white; padding: 10px; text-align: left; }
          </style>
        </head>
        <body>
          <h2>Family Expense & Khata Report</h2>
          <p><strong>Total Remaining Balance:</strong> ₹${balance}</p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Note/Person</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${categoryRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('Error', 'PDF banane mein samasya aayi.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.appTitle}>Family Expense & Khata App</Text>

      <View style={[styles.balanceCard, balance < 2000 ? styles.lowBalance : styles.normalBalance]}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>₹{balance}</Text>
        {balance < 2000 && <Text style={styles.alertText}>⚠️ Low Balance Warning!</Text>}
      </View>

      <View style={styles.emiCard}>
        <Text style={styles.emiTitle}>🔔 EMI Reminder</Text>
        <Text style={styles.emiText}>Due Date: {emiDueDate} | Amount: ₹{emiAmount}</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionHeader}>Nayi Entry Karein</Text>

        <View style={styles.typeContainer}>
          {['Expense', 'Income', 'Udhar'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.typeBtn, type === item && styles.activeTypeBtn]}
              onPress={() => setType(item)}
            >
              <Text style={type === item ? styles.activeBtnText : styles.btnText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Amount (₹)"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <TextInput
          style={styles.input}
          placeholder={type === 'Udhar' ? "Kisko diya / Kisse liya (Naam)" : "Note / Description"}
          value={personOrNotes}
          onChangeText={setPersonOrNotes}
        />

        {type === 'Expense' && (
          <View style={styles.categoryContainer}>
            {['Food', 'Groceries', 'Bills', 'Travel'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catBtn, category === cat && styles.activeCatBtn]}
                onPress={() => setCategory(cat)}
              >
                <Text style={category === cat ? styles.activeBtnText : styles.btnText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.addBtn} onPress={handleAddTransaction}>
          <Text style={styles.addBtnText}>+ Entry Save Karein</Text>
        </TouchableOpacity>
      </View>

      {/* PDF Export Button */}
      <TouchableOpacity style={styles.pdfBtn} onPress={exportCategoryPDF}>
        <Text style={styles.pdfBtnText}>📄 Export / Print Category PDF</Text>
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>Recent Transactions & Khata</Text>
      {transactions.length === 0 ? (
        <Text style={styles.emptyText}>Abhi koi entry nahi hai.</Text>
      ) : (
        transactions.map((item) => (
          <View key={item.id} style={styles.txCard}>
            <View>
              <Text style={styles.txType}>{item.type.toUpperCase()} - {item.personOrNotes}</Text>
              <Text style={styles.txSub}>{item.date} {item.type === 'Expense' ? `| ${item.category}` : ''}</Text>
            </View>
            <Text style={[styles.txAmount, item.type === 'Income' ? styles.greenText : styles.redText]}>
              {item.type === 'Income' ? '+' : '-'}₹{item.amount}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f8', padding: 16, paddingTop: 40 },
  appTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 15, textAlign: 'center' },
  balanceCard: { padding: 20, borderRadius: 12, marginBottom: 15, alignItems: 'center' },
  normalBalance: { backgroundColor: '#2e7d32' },
  lowBalance: { backgroundColor: '#c62828' },
  balanceLabel: { color: '#fff', fontSize: 14 },
  balanceAmount: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  alertText: { color: '#ffeb3b', marginTop: 5, fontWeight: 'bold' },
  emiCard: { backgroundColor: '#fff8e1', padding: 12, borderRadius: 8, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#ffa000' },
  emiTitle: { fontWeight: 'bold', color: '#b78103' },
  emiText: { fontSize: 12, color: '#555', marginTop: 2 },
  formCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 2 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  typeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  typeBtn: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, alignItems: 'center', marginHorizontal: 2 },
  activeTypeBtn: { backgroundColor: '#1976d2', borderColor: '#1976d2' },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  catBtn: { padding: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 15, marginRight: 6, marginBottom: 6 },
  activeCatBtn: { backgroundColor: '#388e3c', borderColor: '#388e3c' },
  btnText: { color: '#333', fontSize: 12 },
  activeBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10, backgroundColor: '#fafafa' },
  addBtn: { backgroundColor: '#1976d2', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  pdfBtn: { backgroundColor: '#388e3c', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  pdfBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 10, marginBottom: 30 },
  txCard: { backgroundColor: '#fff', padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  txType: { fontWeight: 'bold', fontSize: 14 },
  txSub: { fontSize: 11, color: '#777', marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: 'bold' },
  greenText: { color: '#2e7d32' },
  redText: { color: '#c62828' }
});
