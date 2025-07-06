def check_values(dic):
    if any(value is None for value in dic.values()):
        return False
    else:
        return True