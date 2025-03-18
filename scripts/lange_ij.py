# Download the latest wordlist.txt from OpenTaal and place it in the same folder!
import re

words = set()
with open("wordlist.txt", "r", encoding="utf-8") as f:
  words = set(f.read().splitlines())

exceptions = set((
  "Beijing",
  "bijectie",
  "bijectief",
  "bijecties",
  "bijectieve",
  "bijou",
  "bijous",
  "bijouterie",
  "bijouterieën",
  "bijoutje",
  "Dijon",
  "dijonmosterd",
  "Elijah",
  "Elijahs",
  "Fiji",
  "Fiji-eilanden",
  "Fijiër",
  "Fijisch",
  "Fijische",
  "Golf van Rijeka",
  # "hijab",
  "Khadija",
  "Khadija's",
  "Marija",
  "Marija's",
  # "millijoule",
  "Rijeka",
  "Rijeka's",
))


words = set(
  word.replace("ij", "ĳ") for word in words if word not in exceptions
)
words = set(
  word\
    .replace("á", "a")\
    .replace("é", "e")\
    .replace("í", "i")\
    .replace("ó", "o")\
    .replace("ú", "u")\
    .replace("ä", "a")\
    .replace("ë", "e")\
    .replace("ï", "i")\
    .replace("ö", "o")\
    .replace("ü", "u")\
  for word in words
)

regex = r"^[a-zäëïöüĳ]+$"
words = set(
  word for word in words if re.match(regex, word) != None
)

words = set(
  word.upper() for word in words if len(word) == 5
)

listed = list(words)
listed.sort()

with open("../docs/js/dictionary.js", "w", encoding="utf-8") as f:
  f.write(
    'export const words = ["' +
    '","'.join(listed)
    + '"];'
  )