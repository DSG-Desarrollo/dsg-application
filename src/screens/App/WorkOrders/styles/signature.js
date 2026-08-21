import { StyleSheet } from 'react-native';

export const signature = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  formContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  canvasContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  fixedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  input: {
    height: 50,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: "#333",
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
  },
  underline: {
    borderBottomWidth: 1,
    borderBottomColor: "#888",
  },
  inputError: {
    borderColor: "red",
    borderWidth: 1,
  },
  errorText: {
    color: "#C0392B",
    fontSize: 14,
    fontWeight: "bold",
  },
  buttonContainer: {
    marginTop: 20,
  },
  customButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  customButton: {
    backgroundColor: "#ff6347",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
  },
  errorContainer: {
    marginTop: 5,
    backgroundColor: "#F8D7DA",
    padding: 5,
    borderRadius: 5,
  },
  customButtonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
});