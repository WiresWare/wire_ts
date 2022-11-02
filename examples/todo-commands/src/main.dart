import 'dart:html';

import 'package:wire/wire.dart';
import 'package:wire_example_shared/todo/controller/route_controller.dart';
import 'package:wire_example_shared/todo/middleware/todo_middleware.dart';
import 'package:wire_example_todo/view.dart';
import 'package:wire_example_todo_commands/middleware/storage_middleware.dart';
import 'package:wire_example_todo_commands/service/database_service_web.dart';
import 'package:wire_example_todo_commands/src/controller/todo_controller.dart';

void main() async {
  Wire.put(WebDatabaseService());

  final storage = StorageMiddleware();
  await storage.whenReady;

  Wire.middleware(storage);
  Wire.middleware(TodoMiddleware());

  TodoController();
  RouteController();

  TodoView();

  document.querySelector('#loading')?.remove();
}
