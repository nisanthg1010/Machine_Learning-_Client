
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import io
import json
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.svm import SVC, SVR
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.naive_bayes import GaussianNB
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.metrics import (
    accuracy_score, 
    mean_squared_error, 
    mean_absolute_error,
    r2_score,
    confusion_matrix, 
    classification_report, 
    precision_score,
    recall_score,
    f1_score,
    silhouette_score
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "ML Service is running"}

def process_classification(model, X_train, X_test, y_train, y_test):
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    
    # Get classification report with zero_division handling
    report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
    
    # Calculate confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    
    # Calculate additional metrics with averaging
    try:
        precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    except:
        precision = recall = f1 = 0
    
    return {
        "type": "classification",
        "accuracy": float(acc),
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1),
        "report": report,
        "confusion_matrix": cm.tolist(),
        "predictions": y_pred.tolist()[:50],
        "actual": y_test.tolist()[:50]
    }

def process_regression(model, X_train, X_test, y_train, y_test):
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    
    # Calculate comprehensive regression metrics
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    
    # R² score with error handling
    try:
        r2 = r2_score(y_test, y_pred)
    except:
        r2 = 0.0
    
    return {
        "type": "regression",
        "mse": float(mse),
        "rmse": float(rmse),
        "mae": float(mae),
        "r2_score": float(r2),
        "predictions": y_pred.tolist()[:50],
        "actual": y_test.tolist()[:50]
    }

@app.post("/train")
async def train_model(
    file: UploadFile = File(...),
    algorithm: str = Form(...),
    target_column: str = Form(...),
    parameters: str = Form(...)
):
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        if target_column and target_column not in df.columns:
            return {"error": f"Target column '{target_column}' not found"}
        
        # Simple preprocessing: Drop NaNs
        df = df.dropna()
        
        # Features/target selection. For clustering we ignore the target values but still allow the column to exist.
        if target_column and target_column in df.columns:
            feature_df = df.drop(columns=[target_column])
            y = df[target_column]
        else:
            feature_df = df.copy()
            y = None

        # Handle categorical data simply for demo (get_dummies)
        X = pd.get_dummies(feature_df)

        def ensure_numeric_target(series):
            """Ensure regression targets are numeric; return (ok, numeric_series or error_message)."""
            y_num = pd.to_numeric(series, errors='coerce')
            if y_num.isna().any():
                sample_bad = series[y_num.isna()].iloc[:1].to_list()
                msg = f"Target column must be numeric for regression. Found non-numeric values like {sample_bad}. Choose a classification algorithm or provide numeric targets."
                return False, msg
            return True, y_num
        
        params = json.loads(parameters)
        result = {}

        # Clustering (unsupervised)
        if algorithm == "K-Means Clustering":
            model = KMeans(**params)
            model.fit(X)
            labels = model.labels_.tolist()
            sil = silhouette_score(X, model.labels_) if len(set(labels)) > 1 else None
            counts = pd.Series(labels).value_counts().to_dict()
            result = {
                "type": "clustering",
                "algorithm": "kmeans",
                "n_clusters": getattr(model, 'n_clusters', len(set(labels))),
                "silhouette": sil,
                "cluster_counts": counts,
                "labels_preview": labels[:50],
                "centers": model.cluster_centers_.tolist() if hasattr(model, 'cluster_centers_') else None
            }

        elif algorithm == "DBSCAN":
            model = DBSCAN(**params)
            model.fit(X)
            labels = model.labels_.tolist()
            # Exclude noise (-1) when computing silhouette if all points noise then skip
            unique_labels = set(labels)
            sil = None
            if len(unique_labels - {-1}) > 1:
                # Filter out noise rows for silhouette
                mask = [l != -1 for l in labels]
                sil = silhouette_score(X[mask], np.array(labels)[mask]) if any(mask) else None
            counts = pd.Series(labels).value_counts().to_dict()
            result = {
                "type": "clustering",
                "algorithm": "dbscan",
                "n_clusters": len(unique_labels - {-1}),
                "silhouette": sil,
                "cluster_counts": counts,
                "labels_preview": labels[:50]
            }

        elif algorithm == "Agglomerative Clustering":
            model = AgglomerativeClustering(**params)
            labels = model.fit_predict(X)
            labels_list = labels.tolist()
            sil = silhouette_score(X, labels) if len(set(labels_list)) > 1 else None
            counts = pd.Series(labels_list).value_counts().to_dict()
            result = {
                "type": "clustering",
                "algorithm": "agglomerative",
                "n_clusters": getattr(model, 'n_clusters_', len(set(labels_list))),
                "silhouette": sil,
                "cluster_counts": counts,
                "labels_preview": labels_list[:50]
            }

        # Supervised
        elif algorithm == "Linear Regression":
            if y is None:
                return {"error": "Target column required for regression"}
            ok, y_num = ensure_numeric_target(y)
            if not ok:
                return {"error": y_num}
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            y_train = y_train.astype(float)
            y_test = y_test.astype(float)
            model = LinearRegression(**params)
            result = process_regression(model, X_train, X_test, y_train, y_test)
            result['coefficients'] = model.coef_.tolist()
            result['intercept'] = model.intercept_
            
        elif algorithm == "Logistic Regression":
            if y is None:
                return {"error": "Target column required for classification"}
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            model = LogisticRegression(**params)
            result = process_classification(model, X_train, X_test, y_train, y_test)
            
        elif algorithm == "Decision Tree":
            # Detect if regression or classification based on target type
            if y is None:
                return {"error": "Target column required for Decision Tree"}
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            if y.dtype == 'object' or len(y.unique()) < 20:
                model = DecisionTreeClassifier(**params)
                result = process_classification(model, X_train, X_test, y_train, y_test)
            else:
                ok, y_num = ensure_numeric_target(y)
                if not ok:
                    return {"error": y_num}
                y_train = y_train.astype(float)
                y_test = y_test.astype(float)
                model = DecisionTreeRegressor(**params)
                result = process_regression(model, X_train, X_test, y_train, y_test)

        elif algorithm == "Random Forest":
            if y is None:
                return {"error": "Target column required for Random Forest"}
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            if y.dtype == 'object' or len(y.unique()) < 20:
                model = RandomForestClassifier(**params)
                result = process_classification(model, X_train, X_test, y_train, y_test)
            else:
                ok, y_num = ensure_numeric_target(y)
                if not ok:
                    return {"error": y_num}
                y_train = y_train.astype(float)
                y_test = y_test.astype(float)
                model = RandomForestRegressor(**params)
                result = process_regression(model, X_train, X_test, y_train, y_test)
                 
        elif algorithm == "SVM":
            if y is None:
                return {"error": "Target column required for SVM"}
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            if y.dtype == 'object' or len(y.unique()) < 20:
                model = SVC(**params)
                result = process_classification(model, X_train, X_test, y_train, y_test)
            else:
                ok, y_num = ensure_numeric_target(y)
                if not ok:
                    return {"error": y_num}
                y_train = y_train.astype(float)
                y_test = y_test.astype(float)
                model = SVR(**params)
                result = process_regression(model, X_train, X_test, y_train, y_test)

        elif algorithm == "KNN":
            # Choose classifier vs regressor based on target type
            if y is None:
                return {"error": "Target column required for KNN"}
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            if y.dtype == 'object' or len(y.unique()) < 20:
                model = KNeighborsClassifier(**params)
                result = process_classification(model, X_train, X_test, y_train, y_test)
            else:
                ok, y_num = ensure_numeric_target(y)
                if not ok:
                    return {"error": y_num}
                y_train = y_train.astype(float)
                y_test = y_test.astype(float)
                model = KNeighborsRegressor(**params)
                result = process_regression(model, X_train, X_test, y_train, y_test)

        # Naive Bayes (Gaussian)
        elif algorithm == "Naive Bayes":
            if y is None:
                return {"error": "Target column required for Naive Bayes"}
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            model = GaussianNB(**params)
            result = process_classification(model, X_train, X_test, y_train, y_test)

        return {"status": "success", "results": result}

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
