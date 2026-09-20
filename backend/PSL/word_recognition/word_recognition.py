import PSL.helper.helperFunc as helper
import PSL.helper.scale as scale
import PSL.helper.move as move

import json
import math
import pickle
import numpy as np

from tensorflow.keras.models import load_model


model  = load_model("data/models/word_model.h5")
scaler = pickle.load(open("data/models/word_scaler.pkl", "rb"))
le     = pickle.load(open("data/models/word_label_encoder.pkl", "rb"))
print("word model loaded")


def match_ann(fileName):
    js = json.loads(open(fileName).read())
    for items in js['people']:
        handRight = items["hand_right_keypoints_2d"]

    confPoints = helper.confidencePoints(handRight)
    confidence = helper.confidence(confPoints)

    if confidence > 10:
        handPoints = helper.removePoints(handRight)

        p1 = [handPoints[0], handPoints[1]]
        p2 = [handPoints[18], handPoints[19]]
        distance = math.sqrt(((p1[0] - p2[0]) ** 2) + ((p1[1] - p2[1]) ** 2))
        if distance == 0:
            return "no confidence"

        result, _ = scale.scalePoints(handPoints, distance)
        handRightResults, _ = move.centerPoints(result)

        y_pred = model.predict(scaler.transform(np.array([handRightResults])), verbose=0)
        C = np.argmax(y_pred)
        return le.inverse_transform([C])[0]
    else:
        return "no confidence"
