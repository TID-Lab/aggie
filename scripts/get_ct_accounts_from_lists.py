import json
import requests
from collections import defaultdict

lists_url = "https://api.crowdtangle.com/lists"

headers = {
    'x-api-token': "" , #Add CT dashboard token here
    'Cache-Control': "no-cache",
    }

lists = requests.request("GET", lists_url, headers=headers)
lists = json.loads(lists.text)
# print(lists_response)
list_dict = {}
#storing list ids and list names
for obj in lists["result"]["lists"]:
    # print(obj["id"])
    list_dict[str(obj["id"])] = {"title": obj["title"]}

# print(json.dumps(list_dict, indent=4, ensure_ascii=False))

#prepping for paginations
paginations = []
for l_name in list_dict.keys():
    paginations.append({"list_id":str(l_name), "request":"https://api.crowdtangle.com/lists/{}/accounts".format(str(l_name))})


while paginations:
    acc_obj = paginations.pop(0)
    list_id = acc_obj["list_id"]
    acc_request = acc_obj["request"]
    print("Current request: {}\n".format(acc_request))
    accounts_response = requests.request("GET", acc_request, headers=headers)
    accounts_response = json.loads(accounts_response.text)
    if "result" in accounts_response:
        for acc in accounts_response["result"]["accounts"]:
            if "accounts" not in list_dict[list_id]:
                list_dict[list_id]["accounts"] = [acc["id"]]
            else:
                list_dict[list_id]["accounts"].append(acc["id"])
        if "pagination" in accounts_response["result"] and "nextPage" in accounts_response["result"]["pagination"]:
            paginations.append({"list_id": list_id, "request":accounts_response["result"]["pagination"]["nextPage"]})


output_dict = {}
#correcting the format of dict for aggie
for l_name, l_dict in list_dict.items():
    if "accounts" in l_dict:
        for acc in l_dict["accounts"]:
            output_dict[str(acc)] = l_dict["title"]



# print(json.dumps(output_dict, indent=4, ensure_ascii=False))
with open("../config/crowdtangle_list.json", "w") as out:
    json.dump(output_dict, out, indent=4, ensure_ascii=False)




# print(json.dumps(list_dict, indent=4, ensure_ascii=False))
# with open("new_output1.json", "w") as out:
    # json.dump(list_dict, out, indent=4, ensure_ascii=False)


# print(paginations)







