import xlrd
import csv
import json

def cleanCBSA(cbsa):
	if cbsa == "All CBSAs":
		return ["All-CBSAs","All CBSAs"]
	cbsaName = cbsa.split(",")[0]
	return [cbsaName.replace(" ","-").replace("--","-").replace(".","").replace("/","-"), cbsaName.split("-")[0].replace("Louisville/Jefferson County","Louisville") + " Area, " + cbsa.split(",")[1].split("-")[0].strip()]

def cleanNTEE(ntee):
	nteeName = ntee[ntee.find(" ")+1:]
	return [nteeName.replace(" ","-"), nteeName]

output = csv.writer(open("data/data.csv","wb"))
output.writerow(["location","location_type","topic","start_year","percent_no_change","percent_slight_loss","percent_large_loss","percent_slight_increase","percent_large_increase"])
for i in range(1994, 2014):
	fname = "data/source/Almanac Data Viz Growth %i-%i.xlsx"%(i, i+1)
	book = xlrd.open_workbook(fname)

#State tab
	sheet = book.sheet_by_name("State")
	for r in range(1, sheet.nrows):
		outRow = []
		outRow.append(sheet.cell(r, 0).value)
		if sheet.cell(r, 0).value == "All USA":
			outRow.append("all_usa")
		else:
			outRow.append("state")
		outRow.append("aggregate")
		outRow.append(i)
		outRow.append(sheet.cell(r, 10).value)
		outRow.append(sheet.cell(r, 8).value)
		outRow.append(sheet.cell(r, 6).value)
		outRow.append(sheet.cell(r, 12).value)
		outRow.append(sheet.cell(r, 14).value)
		output.writerow(outRow)
#CBSA tab
	sheet = book.sheet_by_name("CBSA")
	cbsaJS = {}
	for r in range(1, sheet.nrows):
		outRow = []
		cbsa = sheet.cell(r, 1).value
		cbsaJS[cbsa] = cleanCBSA(cbsa)
		outRow.append(cbsa)
		if sheet.cell(r, 0).value == "All CBSAs":
			outRow.append("all_cbsa")
		else:
			outRow.append("cbsa")
		outRow.append("aggregate")
		outRow.append(i)
		outRow.append(sheet.cell(r, 11).value)
		outRow.append(sheet.cell(r, 9).value)
		outRow.append(sheet.cell(r, 7).value)
		outRow.append(sheet.cell(r, 13).value)
		outRow.append(sheet.cell(r, 15).value)
		output.writerow(outRow)
#NTEE tab
	sheet = book.sheet_by_name("NTEE")
	nteeJS = {}
	for r in range(1, sheet.nrows):
		if sheet.cell(r, 0).value == "All Types":
			continue
		ntee = sheet.cell(r, 0).value
		nteeJS[ntee] = cleanNTEE(ntee)
		outRow = []
		outRow.append("aggregate")
		outRow.append("aggregate")
		outRow.append(ntee)
		outRow.append(i)
		outRow.append(sheet.cell(r, 10).value)
		outRow.append(sheet.cell(r, 8).value)
		outRow.append(sheet.cell(r, 6).value)
		outRow.append(sheet.cell(r, 12).value)
		outRow.append(sheet.cell(r, 14).value)
		output.writerow(outRow)
#State and NTEE tab
	sheet = book.sheet_by_name("State and NTEE")
	for r in range(1, sheet.nrows):
		outRow = []
		outRow.append(sheet.cell(r, 0).value)
		outRow.append("state")
		outRow.append(sheet.cell(r, 1).value)
		outRow.append(i)
		outRow.append(sheet.cell(r, 12).value)
		outRow.append(sheet.cell(r, 10).value)
		outRow.append(sheet.cell(r, 8).value)
		outRow.append(sheet.cell(r, 14).value)
		outRow.append(sheet.cell(r, 16).value)
		output.writerow(outRow)
# CBSA and NTEE tab
	sheet = book.sheet_by_name("CBSA and NTEE")
	for r in range(1, sheet.nrows):
		outRow = []
		outRow.append(sheet.cell(r, 1).value)
		outRow.append("cbsa")
		outRow.append(sheet.cell(r, 2).value)
		outRow.append(i)
		outRow.append(sheet.cell(r, 13).value)
		outRow.append(sheet.cell(r, 11).value)
		outRow.append(sheet.cell(r, 9).value)
		outRow.append(sheet.cell(r, 15).value)
		outRow.append(sheet.cell(r, 17).value)
		output.writerow(outRow)

# with open('data/cbsas.js', 'w') as fp:
# 	fp.write("CBSAS=")
# 	json.dump(cbsaJS, fp)

# with open('data/ntees.js', 'w') as fp:
# 	fp.write("NTEES=")
# 	json.dump(nteeJS, fp)

	