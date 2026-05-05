import csv
import io
import os
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from database import get_db
from models import Idea, IdeaCreate, IdeaResponse

app = FastAPI(title="Student Ideas API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/ideas", response_model=List[IdeaResponse])
def list_ideas(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    sort: Optional[str] = Query("newest"),
    db: Session = Depends(get_db),
):
    q = db.query(Idea)
    if search:
        term = f"%{search}%"
        q = q.filter(or_(Idea.title.ilike(term), Idea.description.ilike(term)))
    if category:
        q = q.filter(Idea.category == category)
    if sort == "votes":
        q = q.order_by(desc(Idea.votes), desc(Idea.created_at))
    else:
        q = q.order_by(desc(Idea.created_at))
    return q.all()


@app.get("/api/ideas/export")
def export_ideas(db: Session = Depends(get_db)):
    ideas = db.query(Idea).order_by(desc(Idea.created_at)).all()
    fields = ["id", "title", "description", "student_name", "category", "contact_email", "votes", "created_at"]

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fields)
    writer.writeheader()
    for idea in ideas:
        writer.writerow({f: getattr(idea, f, "") for f in fields})

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=ideas.csv"},
    )


@app.get("/api/categories", response_model=List[str])
def list_categories(db: Session = Depends(get_db)):
    rows = db.query(Idea.category).filter(Idea.category.isnot(None)).distinct().all()
    return sorted(r[0] for r in rows if r[0])


@app.post("/api/ideas", response_model=IdeaResponse, status_code=201)
def create_idea(payload: IdeaCreate, db: Session = Depends(get_db)):
    idea = Idea(**payload.model_dump())
    db.add(idea)
    db.commit()
    db.refresh(idea)
    return idea


@app.post("/api/ideas/{idea_id}/upvote", response_model=IdeaResponse)
def upvote_idea(idea_id: int, db: Session = Depends(get_db)):
    idea = db.get(Idea, idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Idea not found")
    idea.votes += 1
    db.commit()
    db.refresh(idea)
    return idea


# Serve React build in production
_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(_dist):
    app.mount("/", StaticFiles(directory=_dist, html=True), name="static")
