# import csv package
import csv

# set the filepath
filepath = "./PyBank/budget_data.csv"

# declare variables
Num_Months = 0
Total_PL = 0
Total_Change = 0
Last_Month_PL = 0
Average_Change = 0
Month_Change = 0
Max_Increase = 0
Max_Decrease = 0

# open csv file
with open(filepath, newline = "") as csvfile:
    csvreader = csv.reader(csvfile, delimiter = ",")
    header = next(csvreader)
    for row in csvreader:
        
        # count the total number of months
        Num_Months = Num_Months + 1
        
        # calculate the total amount of profit and loss
        Total_PL = Total_PL + float(row[1])
        
        # calculate the total amount of change
        if Num_Months == 1:
            Total_Change = 0
            Month_Change = 0
        else: 
            Month_Change = float(row[1]) - Last_Month_PL
            Total_Change = Month_Change + Total_Change
        
        Last_Month_PL = float(row[1])
        
        # compare and find the greatest increase in profit and loss, and the greatest decrease in profit and loss
        if Max_Increase < Month_Change:
            Max_Increase = Month_Change
            Max_Increase_Date = row[0]
        
        if Max_Decrease > Month_Change:
            Max_Decrease = Month_Change
            Max_Decrease_Date = row[0]

# Calculate the Average Change
Average_Change = round(Total_Change / Num_Months, 2)


# print results
print("Financial Analysis")
print("-----------------------------")
print("Total Months: " + str(Num_Months))
print("Total: " + str(Total_PL))
print("Average Change: " + str(f"${Average_Change}"))
print(f"Greatest Increase in Profits: {Max_Increase_Date} ${Max_Increase}")
print(f"Greatest decrease in Profits: {Max_Decrease_Date} ${Max_Decrease}")

# output to a txt file
with open("PyBank.txt", "w") as BankResult:
    BankResult.write("Financial Analysis \n")
    BankResult.write("----------------------------- \n")
    BankResult.write("Total Months: " + str(Num_Months) + "\n")
    BankResult.write("Total: " + str(Total_PL) + "\n")
    BankResult.write("Average Change: " + str(f"${Average_Change}") + "\n")
    BankResult.write(f"Greatest Increase in Profits: {Max_Increase_Date} ${Max_Increase}" + "\n")
    BankResult.write(f"Greatest decrease in Profits: {Max_Decrease_Date} ${Max_Decrease}")