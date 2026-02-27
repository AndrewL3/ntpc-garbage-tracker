CREATE TABLE "pass_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"route_line_id" text NOT NULL,
	"stop_rank" integer NOT NULL,
	"car" text NOT NULL,
	"passed_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pass_events_route_line_id_stop_rank_car_unique" UNIQUE("route_line_id","stop_rank","car")
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" serial PRIMARY KEY NOT NULL,
	"line_id" text NOT NULL,
	"line_name" text NOT NULL,
	"city" text NOT NULL,
	CONSTRAINT "routes_line_id_unique" UNIQUE("line_id")
);
--> statement-breakpoint
CREATE TABLE "stops" (
	"id" serial PRIMARY KEY NOT NULL,
	"route_line_id" text NOT NULL,
	"rank" integer NOT NULL,
	"name" text NOT NULL,
	"village" text NOT NULL,
	"longitude" double precision NOT NULL,
	"latitude" double precision NOT NULL,
	"scheduled_time" text NOT NULL,
	"memo" text DEFAULT '' NOT NULL,
	"garbage_days" boolean[] NOT NULL,
	"recycling_days" boolean[] NOT NULL,
	"foodscraps_days" boolean[] NOT NULL,
	CONSTRAINT "stops_route_line_id_rank_unique" UNIQUE("route_line_id","rank")
);
--> statement-breakpoint
ALTER TABLE "pass_events" ADD CONSTRAINT "pass_events_route_line_id_routes_line_id_fk" FOREIGN KEY ("route_line_id") REFERENCES "public"."routes"("line_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stops" ADD CONSTRAINT "stops_route_line_id_routes_line_id_fk" FOREIGN KEY ("route_line_id") REFERENCES "public"."routes"("line_id") ON DELETE no action ON UPDATE no action;