# import the package
import csv

# set the filepath
filepath = "./PyPoll/election_data.csv"

# open csv file
with open(filepath, newline="") as csvfile:
    csvreader = csv.reader(csvfile)
    header = next(csvreader)
    vote_count = 0
    candidates_list = []
    for row in csvreader:
        
        # calculate the Total Votes
        vote_count = vote_count + 1
        
        # generate a list of candidates
        candidates_list.append(row[2])

# remove duplicates in the list
simplified_candidates = list(set(candidates_list))

# count the votes for each candidate
individual_votes = []
for i in range(0, len(simplified_candidates)):
    individual_votes.append(candidates_list.count(simplified_candidates[i]))

# calculate the percentage of votes each candidate earns
percentage = []
for j in range(0, len(individual_votes)):
    percentage.append(f"{round(individual_votes[j] / vote_count * 100, 3)}%")

# combine candidate names, individual votes and percentage of votes into one list
consolidated_list = []
for x in range(0, len(individual_votes)):
    consolidated_list.append([simplified_candidates[x], percentage[x], individual_votes[x]])

# take third element for sort
def takeThird(element):
    return element[2]

# sort the consolidated list by number of votes received
consolidated_list.sort(key = takeThird, reverse = True)

# print the result
print("Election Results")
print("----------------------")
print(f"Total Votes {vote_count}")
print("----------------------")
for item in consolidated_list:
    print(f"{item[0]}: {item[1]} ({item[2]})")
print("----------------------")
print(f"Winner: {consolidated_list[0][0]}")
print("----------------------")

# output the result into txt
with open("PyPoll.txt", "w") as PollResult:
    PollResult.write("Election Results\n")
    PollResult.write("----------------------\n")
    PollResult.write(f"Total Votes {vote_count}\n")
    PollResult.write("----------------------\n")
    for item in consolidated_list:
        PollResult.write(f"{item[0]}: {item[1]} ({item[2]}) \n")
    PollResult.write("----------------------\n")
    PollResult.write(f"Winner: {consolidated_list[0][0]}\n")
    PollResult.write("----------------------")