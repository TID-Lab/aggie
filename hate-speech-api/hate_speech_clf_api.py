import sys
import pickle
from flask import Flask, jsonify, abort, request
from flask_classful import FlaskView, route
import data_processing.mm_segmenter as mm
from data_processing.mm_converter import zawgyi_to_unicode
import re
import json
from sklearn.ensemble import RandomForestClassifier
import os

app = Flask(__name__)
dir_path = os.path.dirname(os.path.abspath(__file__))

class HateSpeechClassifier(FlaskView):

    def __init__(self):
        self.burmese_segmenter = mm.Segmenter()
        with open(os.path.join(dir_path, "models/vectorizers/oversampled-tfidf-vect.pkl"), 'rb') as vect_b:
            self.vectorizer = pickle.load(vect_b)
        with open(os.path.join(dir_path,"models/clfs/oversampled-RFClf-tfidf.pkl"), 'rb') as clf_b:
            self.model = pickle.load(clf_b)

    #Internal functions. Not exposed via API    
    def _preprocess(self, text_document):
        non_burmese_pattern = re.compile("[^"u"\U00001000-\U0000109F"u"\U00000020""]+", flags=re.UNICODE)
        try:
            preprocessed_text_document = re.sub("\s+", ' ', non_burmese_pattern.sub('', text_document)) 
            if len(preprocessed_text_document) ==0 :
                return ""
            preprocessed_text_document = zawgyi_to_unicode(preprocessed_text_document)
            preprocessed_text_document = " ".join(self.burmese_segmenter.segment(preprocessed_text_document))
        except ValueError as e:
            abort(400)
        return preprocessed_text_document

    #API endpoints
    @route('/')
    def test(self):
        return jsonify('Hate Speech API is running')

    @route("/preprocess", methods=["POST"])
    def preprocess(self):
        try:
            input_data = request.get_json()["inputData"]
        except ValueError as e:
            abort(400)
        preprocessed_data = [self._preprocess(text_document) for text_document in input_data]
        return jsonify(preprocessed_data) 

    def fit(self, X_train, y_train):
        raise NotImplementedError

    @route("/predict", methods=["POST"])
    def predict(self):
        try:
            input_data = request.get_json()["inputData"]
        except ValueError as e:
            abort(400)
        input_data = self._preprocess(input_data)
        if len(input_data) == 0: return jsonify({"result" : {"input" : input_data, "hateSpeechScore": 0}})

        input_data_vect = self.vectorizer.transform([input_data])
        predicted_values = map(lambda x: x[1],self.model.predict_proba(input_data_vect))[0]
        return jsonify({"result" : {"input" : input_data, "hateSpeechScore": predicted_values}})

    @route("/batch_predict", methods=["POST"])
    def batch_predict(self):
        try:
            input_data = request.get_json()["inputData"]
        except ValueError as e:
            abort(400)
        input_data = [self._preprocess(text_document) for text_document in input_data]
        input_data_vect = self.vectorizer.transform(input_data)
        predicted_values = map(lambda x: x[1],self.model.predict_proba(input_data_vect))
        return jsonify({"result" : list(zip(list(input_data), list(predicted_values)))})

HateSpeechClassifier.register(app, route_base = '/')

if __name__ == '__main__':
    app.run(debug=False, host='127.0.0.1', port=5000)
